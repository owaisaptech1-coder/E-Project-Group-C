(function () {
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function initReveals() {
    var elements = document.querySelectorAll(".experience-reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function initTilt() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll(".product-card, .testi-card, .craft-item, .store-card, .stat-card, .value-card, .pd-main-image").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var bounds = card.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width - 0.5;
        var y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 3).toFixed(2) + "deg) rotateY(" + (x * 4).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  function initMagneticButtons() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll(".btn-alberto, .btn-alberto-outline, .btn-hero-primary, .btn-hero-secondary").forEach(function (button) {
      button.dataset.magnetic = "true";
      button.addEventListener("mousemove", function (event) {
        var bounds = button.getBoundingClientRect();
        var x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
        var y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
        button.style.transform = "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px)";
      });
      button.addEventListener("mouseleave", function () { button.style.transform = ""; });
    });
  }

  function initHeroDepth() {
    var hero = document.querySelector('.hero-home');
    var slider = hero && hero.querySelector('.luxury-hero-slider');
    if (!hero || !slider || reducedMotion || !finePointer) return;
    hero.addEventListener('mousemove', function (event) {
      var bounds = hero.getBoundingClientRect();
      var x = (event.clientX - bounds.left) / bounds.width - 0.5;
      var y = (event.clientY - bounds.top) / bounds.height - 0.5;
      slider.style.transform = 'translate3d(' + (x * 10).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px,0) rotateY(' + (x * 2).toFixed(2) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { slider.style.transform = ''; });
  }

  function initCursor() {
    if (reducedMotion || !finePointer) return;
    var dot = document.createElement("span");
    var ring = document.createElement("span");
    dot.className = "alberto-cursor-dot";
    ring.className = "alberto-cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-custom-cursor");
    document.addEventListener("mousemove", function (event) {
      dot.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0)";
      ring.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0)";
    });
    document.querySelectorAll("a, button, .product-card").forEach(function (element) {
      element.addEventListener("mouseenter", function () { ring.classList.add("is-hovering"); });
      element.addEventListener("mouseleave", function () { ring.classList.remove("is-hovering"); });
    });
  }

  function initPageEntry() { document.body.classList.add("experience-ready"); }

  function init() {
    initPageEntry();
    initReveals();
    initTilt();
    initMagneticButtons();
    initHeroDepth();
    initCursor();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
