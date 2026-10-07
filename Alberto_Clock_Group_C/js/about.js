(function () {
  function revealOnScroll() {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  function initValueCards() {
    const cards = document.querySelectorAll('.value-card');
    const detailTitle = document.getElementById('valueDetailTitle');
    const detailText = document.getElementById('valueDetailText');

    if (!cards.length || !detailTitle || !detailText) return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        cards.forEach(function (item) {
          item.classList.toggle('is-active', item === card);
        });

        const title = card.dataset.title || 'Value';
        const text = card.dataset.text || '';
        detailTitle.textContent = title;
        detailText.textContent = text;
      });
    });
  }

  function initCounters() {
    const counters = document.querySelectorAll('.stat-card strong[data-target]');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!counters.length) return;

    function showCounter(counter) {
      const target = Number(counter.dataset.target || 0);
      if (reduceMotion) {
        counter.textContent = target;
        return;
      }
      const started = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - started) / 900);
        counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(showCounter);
      return;
    }
    const observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach(function (counter) { observer.observe(counter); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      revealOnScroll();
      initValueCards();
      initCounters();
    });
  } else {
    revealOnScroll();
    initValueCards();
    initCounters();
  }
})();
