
window.SITE_BASE = /(^|\/)html\//.test(window.location.pathname) ? "../" : "";
window.PAGE_BASE = window.SITE_BASE === "" ? "html/" : "";

(function () {
  "use strict";

  var STORAGE_KEY = "alberto-clocks-theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {

    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }


  var saved = getStoredTheme();
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  }

  function toggleTheme() {
    var isDark = root.getAttribute("data-theme") === "dark";
    var next = isDark ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
  }

  function wireButton() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", toggleTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireButton);
  } else {
    wireButton();
  }
})();
