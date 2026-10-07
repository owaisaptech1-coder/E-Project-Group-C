(function () {
  function initHomeMotion() {
    var hero = document.querySelector('.hero-home');
    if (!hero) return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touchDevice = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var canvas = document.createElement('canvas');
    canvas.className = 'home-motion-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);

    var context = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var rings = [
      { x: 0.78, y: 0.46, radius: 230, speed: 0.00018, phase: 0, alpha: 0.4 },
      { x: 0.78, y: 0.46, radius: 170, speed: -0.00025, phase: 1, alpha: 0.28 },
      { x: 0.22, y: 0.28, radius: 120, speed: 0.00032, phase: 2, alpha: 0.2 }
    ];
    var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    var animationFrame;
    var start = performance.now();

    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      var count = touchDevice ? 34 : 76;
      particles = [];
      for (var i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random(),
          size: Math.random() * 1.8 + 0.7,
          speed: Math.random() * 0.22 + 0.05,
          drift: Math.random() * 0.8 + 0.2,
          alpha: Math.random() * 0.55 + 0.2
        });
      }
    }

    function drawBackground(time) {
      context.clearRect(0, 0, width, height);
      var glow = context.createRadialGradient(width * 0.78, height * 0.46, 10, width * 0.78, height * 0.46, Math.max(width, height) * 0.62);
      glow.addColorStop(0, 'rgba(201,161,90,0.24)');
      glow.addColorStop(0.35, 'rgba(64,111,105,0.12)');
      glow.addColorStop(1, 'rgba(5,7,10,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      var offsetX = pointer.x * 18;
      var offsetY = pointer.y * 14;
      rings.forEach(function (ring) {
        var centerX = width * ring.x + offsetX * (ring.radius / 240);
        var centerY = height * ring.y + offsetY * (ring.radius / 240);
        var rotation = time * ring.speed + ring.phase;
        context.save();
        context.translate(centerX, centerY);
        context.rotate(rotation);
        context.strokeStyle = 'rgba(232,206,156,' + ring.alpha + ')';
        context.lineWidth = 1;
        context.setLineDash([4, 12]);
        context.beginPath();
        context.arc(0, 0, ring.radius, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
        context.strokeStyle = 'rgba(255,255,255,' + (ring.alpha * 0.55) + ')';
        context.beginPath();
        context.arc(0, 0, ring.radius * 0.82, -0.6, 1.05);
        context.stroke();
        context.restore();
      });

      drawGear(width * 0.68 + offsetX * 0.5, height * 0.43 + offsetY * 0.5, 82, time * 0.00035, 0.32);
      drawGear(width * 0.9 + offsetX * 0.25, height * 0.8 + offsetY * 0.25, 46, -time * 0.0006, 0.2);
    }

    function drawGear(x, y, radius, rotation, alpha) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.strokeStyle = 'rgba(232,206,156,' + alpha + ')';
      context.lineWidth = 1;
      context.beginPath();
      for (var i = 0; i < 32; i += 1) {
        var angle = (Math.PI * 2 * i) / 32;
        var currentRadius = i % 2 === 0 ? radius : radius * 0.88;
        var pointX = Math.cos(angle) * currentRadius;
        var pointY = Math.sin(angle) * currentRadius;
        if (i === 0) context.moveTo(pointX, pointY); else context.lineTo(pointX, pointY);
      }
      context.closePath();
      context.stroke();
      context.beginPath();
      context.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(radius * 0.48, 0);
      context.moveTo(0, 0);
      context.lineTo(0, -radius * 0.38);
      context.stroke();
      context.restore();
    }

    function drawParticles(time) {
      particles.forEach(function (particle) {
        var travel = (time * 0.001 * particle.speed) % (height + 40);
        var x = particle.x + pointer.x * (12 + particle.z * 24) + Math.sin(time * 0.0004 * particle.drift + particle.x) * 8;
        var y = (particle.y - travel + height + 40) % (height + 40) - 20 + pointer.y * (8 + particle.z * 18);
        context.fillStyle = 'rgba(232,206,156,' + particle.alpha + ')';
        context.beginPath();
        context.arc(x, y, particle.size * (0.6 + particle.z), 0, Math.PI * 2);
        context.fill();
      });
    }

    function render(now) {
      var time = now - start;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
      drawBackground(time);
      drawParticles(time);
      if (!reducedMotion) animationFrame = requestAnimationFrame(render);
    }

    hero.addEventListener('pointermove', function (event) {
      var bounds = hero.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointer.targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { pointer.targetX = 0; pointer.targetY = 0; });
    window.addEventListener('resize', resize, { passive: true });
    resize();
    render(performance.now());
    if (reducedMotion) drawBackground(0);
    window.addEventListener('pagehide', function () { cancelAnimationFrame(animationFrame); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHomeMotion);
  else initHomeMotion();
})();
