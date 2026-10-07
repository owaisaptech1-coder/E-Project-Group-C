(function () {
  function initGlobalBackground() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const container = document.createElement('div');
    container.className = 'global-motion-bg';
    container.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.className = 'global-motion-canvas';
    container.appendChild(canvas);
    const context = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const particles = [];
    let width = 0;
    let height = 0;
    let animationFrame;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles.length = 0;
      const count = window.innerWidth < 700 ? 34 : 86;
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth: Math.random(),
          radius: Math.random() * 1.6 + 0.35,
          speed: Math.random() * 0.12 + 0.025,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawAtmosphere(time) {
      context.clearRect(0, 0, width, height);
      const driftX = pointer.x * 22;
      const driftY = pointer.y * 16;
      const light = context.createRadialGradient(width * 0.72 + driftX, height * 0.3 + driftY, 0, width * 0.72, height * 0.3, Math.max(width, height) * 0.72);
      light.addColorStop(0, 'rgba(201,161,90,0.16)');
      light.addColorStop(0.32, 'rgba(60,140,122,0.08)');
      light.addColorStop(1, 'rgba(7,9,13,0)');
      context.fillStyle = light;
      context.fillRect(0, 0, width, height);

      const centerX = width * 0.78 + driftX * 0.5;
      const centerY = height * 0.42 + driftY * 0.5;
      [260, 192, 128].forEach(function (radius, index) {
        context.save();
        context.translate(centerX, centerY);
        context.rotate(time * (index % 2 ? -0.00012 : 0.00016) + index);
        context.strokeStyle = 'rgba(232,206,156,' + (0.16 - index * 0.03) + ')';
        context.lineWidth = 1;
        context.setLineDash([3, 14]);
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
        context.beginPath();
        context.arc(0, 0, radius * 0.9, -0.7, 0.65);
        context.stroke();
        context.restore();
      });

      particles.forEach(function (particle) {
        const y = (particle.y - time * 0.001 * particle.speed * 35 + height + 20) % (height + 20) - 20;
        const x = particle.x + pointer.x * (8 + particle.depth * 22) + Math.sin(time * 0.0003 + particle.phase) * 7;
        context.fillStyle = 'rgba(232,206,156,' + (0.16 + particle.depth * 0.35) + ')';
        context.beginPath();
        context.arc(x, y + pointer.y * 14, particle.radius * (0.7 + particle.depth), 0, Math.PI * 2);
        context.fill();
      });
    }

    function render(time) {
      pointer.x += (pointer.targetX - pointer.x) * 0.035;
      pointer.y += (pointer.targetY - pointer.y) * 0.035;
      drawAtmosphere(time);
      animationFrame = requestAnimationFrame(render);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('mousemove', function (event) {
      pointer.targetX = event.clientX / window.innerWidth - 0.5;
      pointer.targetY = event.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    window.addEventListener('pagehide', function () { cancelAnimationFrame(animationFrame); });
    resizeCanvas();

    const layers = [
      { type: 'ring', x: '10%', y: '10%', size: 260, duration: 22, delay: 0, rotation: 0 },
      { type: 'ring', x: '70%', y: '18%', size: 180, duration: 30, delay: 1, rotation: 30 },
      { type: 'ring', x: '82%', y: '62%', size: 220, duration: 27, delay: 2, rotation: 12 },
      { type: 'ring', x: '28%', y: '72%', size: 190, duration: 26, delay: 3, rotation: -10 },
      { type: 'gear', x: '53%', y: '52%', size: 150, duration: 32, delay: 0.5, rotation: 18 },
      { type: 'gear', x: '18%', y: '38%', size: 130, duration: 26, delay: 1.8, rotation: -20 },
      { type: 'sphere', x: '72%', y: '58%', size: 100, duration: 18, delay: 2.4 },
      { type: 'sphere', x: '48%', y: '78%', size: 80, duration: 16, delay: 1.1 },
      { type: 'particle', x: '24%', y: '20%', size: 10, duration: 18, delay: 0 },
      { type: 'particle', x: '88%', y: '26%', size: 9, duration: 16, delay: 1.2 },
      { type: 'particle', x: '12%', y: '80%', size: 8, duration: 22, delay: 2.2 },
      { type: 'particle', x: '66%', y: '84%', size: 10, duration: 20, delay: 1.5 }
    ];

    layers.forEach(function (item, index) {
      const shape = document.createElement('div');
      shape.className = 'bg-shape ' + (item.type === 'ring' ? 'bg-ring' : item.type === 'gear' ? 'bg-gear' : item.type === 'sphere' ? 'bg-sphere' : 'bg-particle');
      const size = item.size + 'px';
      shape.style.width = size;
      shape.style.height = size;
      shape.style.left = item.x;
      shape.style.top = item.y;
      shape.style.animationDelay = item.delay + 's';
      shape.style.animationDuration = item.duration + 's';
      shape.style.transform = 'rotate(' + (item.rotation || 0) + 'deg)';
      if (item.type === 'gear') {
        shape.style.borderRadius = '50%';
        shape.style.background = 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(201,161,90,0.03) 50%, transparent 72%)';
      }
      if (item.type === 'ring') {
        shape.style.borderWidth = '1.2px';
      }
      if (item.type === 'particle') {
        shape.style.width = item.size + 'px';
        shape.style.height = item.size + 'px';
      }
      container.appendChild(shape);
    });

    document.body.insertBefore(container, document.body.firstChild);

    const motion = { x: 0, y: 0 };
    const update = function () {
      const { innerWidth, innerHeight } = window;
      const offsetX = ((window.innerWidth / 2 - motion.x) / innerWidth) * 12;
      const offsetY = ((window.innerHeight / 2 - motion.y) / innerHeight) * 12;
      const shapes = container.querySelectorAll('.bg-shape');
      shapes.forEach(function (shape, index) {
        const depth = (index % 3) + 1;
        const dx = (offsetX / depth) * (index % 2 === 0 ? 1 : -1);
        const dy = (offsetY / depth) * (index % 2 === 0 ? -1 : 1);
        shape.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0) rotate(' + ((index * 12) % 360) + 'deg)';
      });
    };

    document.addEventListener('mousemove', function (event) {
      motion.x = event.clientX;
      motion.y = event.clientY;
      update();
    });

    window.addEventListener('resize', update);
    update();
    render(performance.now());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalBackground);
  } else {
    initGlobalBackground();
  }
})();
