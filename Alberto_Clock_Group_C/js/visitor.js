(function () {
  var STORE_KEY = 'alberto_visitor';
  var SESSION_KEY = 'alberto_visitor_session';

  function readStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writeStore(data) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (err) {

    }
  }

  function newVisitor() {
    return {
      id: 'AC-' + String(Math.floor(1000 + Math.random() * 9000)),
      visits: 0,
      since: new Date().toISOString()
    };
  }

  function countVisit(visitor) {
    var fresh = true;
    try {
      fresh = !window.sessionStorage.getItem(SESSION_KEY);
      if (fresh) window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch (err) {

    }
    if (fresh) visitor.visits += 1;
    return visitor;
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function initVisitorMenu() {
    var menu = document.getElementById('visitorMenu');
    if (!menu) return;

    var chip = menu.querySelector('.visitor-chip');
    var countEl = menu.querySelector('.visitor-count');
    var idEl = menu.querySelector('.visitor-id');
    var visitsEl = menu.querySelector('.visitor-visits');
    var sinceEl = menu.querySelector('.visitor-since');
    var resetBtn = menu.querySelector('.visitor-reset');

    var visitor = countVisit(readStore() || newVisitor());
    writeStore(visitor);

    function paint() {
      if (countEl) countEl.textContent = visitor.visits;
      if (idEl) idEl.textContent = visitor.id;
      if (visitsEl) visitsEl.textContent = visitor.visits;
      if (sinceEl) sinceEl.textContent = formatDate(visitor.since);
    }

    function setOpen(open) {
      menu.classList.toggle('open', open);
      if (chip) chip.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    paint();

    if (chip) {
      chip.addEventListener('click', function (event) {
        event.stopPropagation();
        setOpen(!menu.classList.contains('open'));
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        try { window.sessionStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
        visitor = countVisit(newVisitor());
        writeStore(visitor);
        paint();
      });
    }

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorMenu);
  } else {
    initVisitorMenu();
  }
})();
