
var KAIROS_CART_KEY = "kairos-cart";

function loadCart() {
  try {
    var raw = localStorage.getItem(KAIROS_CART_KEY);
    var parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(KAIROS_CART_KEY, JSON.stringify(KAIROS_CART)); } catch (e) {}
}

var KAIROS_CART = loadCart(); // [{id, qty}]

function imgUrl(seed) {
  return window.SITE_BASE + seed;
}

function cartCount() {
  return KAIROS_CART.reduce(function (sum, l) { return sum + l.qty; }, 0);
}

function updateCartBadge() {
  $(".cart-count").text(cartCount());
}

function showToast(msg) {
  var $t = $("#albertoToast");
  if ($t.length === 0) {
    $t = $('<div id="albertoToast" class="alberto-toast" role="status" aria-live="polite"></div>');
    $("body").append($t);
  }
  $t.text(msg).addClass("show");
  clearTimeout(window.__albertoToastTimer);
  window.__albertoToastTimer = setTimeout(function () { $t.removeClass("show"); }, 2400);
}

var ADD_COOLDOWN_MS = 1200;   // wait time (ms) before the SAME item can be added again
var __lastAddAt = {};
var __cooldownTimers = {};

function escapeHtml(str) {
  return $("<div>").text(str == null ? "" : String(str)).html();
}

function showCartPopup(product, qtyAdded, qtyInBag) {
  var $p = $("#albertoCartPopup");
  if ($p.length === 0) {
    $p = $('<div id="albertoCartPopup" class="cart-popup" role="status" aria-live="polite"></div>');
    $("body").append($p);
    $p.on("click", ".cart-popup-close, .cart-popup-continue", function () {
      $p.removeClass("show");
    });
  }
  var name = product ? product.name : "Item";
  var img = product ? imgUrl(product.seed, 200) : "";
  var meta = product
    ? escapeHtml(product.category) + " \u00b7 " + escapeHtml(product.movement)
    : "";
  var price = product ? formatPKR(product.price * qtyAdded) : "";
  var bagLink = (window.PAGE_BASE || "") + "cart.html";

  $p.html(
    '<button type="button" class="cart-popup-close" aria-label="Close">&times;</button>' +
    '<div class="cart-popup-head"><span class="cart-popup-check">\u2713</span> Added to your bag</div>' +
    '<div class="cart-popup-body">' +
      (img ? '<img src="' + img + '" alt="' + escapeHtml(name) + '">' : "") +
      '<div class="cart-popup-info">' +
        '<h4>' + escapeHtml(name) + '</h4>' +
        '<p class="cart-popup-meta">' + meta + '</p>' +
        '<p class="cart-popup-line"><strong>' + qtyAdded + ' \u00d7</strong> ' +
          (product ? formatPKR(product.price) : "") +
          (qtyAdded > 1 ? ' = ' + price : "") + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="cart-popup-foot">' +
      '<span>' + cartCount() + (cartCount() === 1 ? ' item' : ' items') + ' in bag</span>' +
      '<div class="cart-popup-actions">' +
        '<button type="button" class="cart-popup-continue">Continue</button>' +
        '<a class="cart-popup-view" href="' + bagLink + '">View Bag</a>' +
      '</div>' +
    '</div>' +
    '<div class="cart-popup-bar"><span></span></div>'
  );

  // restart the auto-close progress bar
  $p.removeClass("show");
  void $p[0].offsetWidth;
  $p.addClass("show");
  clearTimeout(window.__albertoCartPopupTimer);
  window.__albertoCartPopupTimer = setTimeout(function () { $p.removeClass("show"); }, 3800);
}

// Cooldown is tracked per product, so only the item you just added is locked.
function startAddCooldown(id) {
  var $btns = $(".js-quick-add").filter(function () { return $(this).data("id") === id; });
  var pageId = new URLSearchParams(window.location.search).get("id");
  if (pageId === id) { $btns = $btns.add("#addToCartBtn"); }

  $btns.each(function () {
    var $b = $(this);
    if ($b.data("origText") === undefined) { $b.data("origText", $b.text()); }
    $b.addClass("is-cooling").prop("disabled", true);
  });
  $btns.filter(".js-quick-add").text("Added \u2713");

  clearTimeout(__cooldownTimers[id]);
  __cooldownTimers[id] = setTimeout(function () {
    $btns.each(function () {
      var $b = $(this);
      $b.removeClass("is-cooling").prop("disabled", false);
      if ($b.data("origText") !== undefined) { $b.text($b.data("origText")); }
    });
  }, ADD_COOLDOWN_MS);
}

// returns true if the item was added, false if blocked by the cooldown
function addToCart(id, qty) {
  qty = qty || 1;
  var now = Date.now();
  if (__lastAddAt[id] && now - __lastAddAt[id] < ADD_COOLDOWN_MS) {
    return false;
  }
  __lastAddAt[id] = now;

  var line = KAIROS_CART.find(function (l) { return l.id === id; });
  if (line) { line.qty += qty; } else { KAIROS_CART.push({ id: id, qty: qty }); }
  saveCart();
  updateCartBadge();
  var product = typeof getProductById === "function" ? getProductById(id) : null;
  showCartPopup(product, qty, line ? line.qty : qty);
  startAddCooldown(id);
  return true;
}

var QA_MODAL_ID = null;

function buildQuickAddModal() {
  if ($("#qaModalOverlay").length) return;
  var html =
    '<div class="qa-modal-overlay" id="qaModalOverlay">' +
      '<div class="qa-modal" role="dialog" aria-modal="true" aria-labelledby="qaModalTitle">' +
        '<button type="button" class="qa-modal-close" aria-label="Close">&times;</button>' +
        '<div class="qa-modal-body">' +
          '<img class="qa-modal-img" src="" alt="">' +
          '<div class="qa-modal-info">' +
            '<p class="qa-modal-eyebrow font-mono"></p>' +
            '<h3 class="qa-modal-title" id="qaModalTitle"></h3>' +
            '<div class="qa-modal-price font-mono"></div>' +
            '<label class="qa-modal-qty-label font-mono">Quantity</label>' +
            '<div class="qty-stepper qa-modal-qty">' +
              '<button type="button" class="qa-qty-minus" aria-label="Decrease quantity">\u2212</button>' +
              '<input type="text" class="qa-qty-input" value="1" readonly aria-label="Quantity">' +
              '<button type="button" class="qa-qty-plus" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<button type="button" class="btn-alberto qa-modal-add">Add to Bag</button>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  $("body").append(html);

  $(document).on("click", "#qaModalOverlay", function (e) {
    if (e.target.id === "qaModalOverlay") closeQuickAddModal();
  });
  $(document).on("click", ".qa-modal-close", closeQuickAddModal);
  $(document).on("click", ".qa-qty-minus", function () {
    var $i = $(".qa-qty-input");
    $i.val(Math.max(1, parseInt($i.val(), 10) - 1));
  });
  $(document).on("click", ".qa-qty-plus", function () {
    var $i = $(".qa-qty-input");
    $i.val(parseInt($i.val(), 10) + 1);
  });
  $(document).on("click", ".qa-modal-add", function () {
    var qty = parseInt($(".qa-qty-input").val(), 10) || 1;
    if (QA_MODAL_ID && addToCart(QA_MODAL_ID, qty)) closeQuickAddModal();
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") closeQuickAddModal();
  });
}

function openQuickAddModal(id) {
  var product = typeof getProductById === "function" ? getProductById(id) : null;
  if (!product) return;
  buildQuickAddModal();
  QA_MODAL_ID = id;
  $(".qa-qty-input").val(1);
  $(".qa-modal-img").attr("src", imgUrl(product.seed, 400)).attr("alt", product.name);
  $(".qa-modal-eyebrow").text(product.category + " \u00b7 " + product.movement);
  $(".qa-modal-title").text(product.name);
  $(".qa-modal-price").text(formatPKR(product.price));
  $("#qaModalOverlay").addClass("show");
  $("body").addClass("qa-modal-open");
}

function closeQuickAddModal() {
  $("#qaModalOverlay").removeClass("show");
  $("body").removeClass("qa-modal-open");
  QA_MODAL_ID = null;
}


document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".luxury-hero-slider");

    if (!slider) return;

    const images = [
        { src: window.SITE_BASE + "images/watch.png", id: "hammer-chrono-60" },
        { src: window.SITE_BASE + "images/watch-1.png", id: "delex-clover" },
        { src: window.SITE_BASE + "images/watch-2.png", id: "noir-minimal" },
        { src: window.SITE_BASE + "images/watch-3.png", id: "sveston-chrono-navy" },
        { src: window.SITE_BASE + "images/watch-4.png", id: "aspire-classic" }
    ];


    const stage = slider.querySelector(".luxury-slider-stage");

    const previousButton =
        slider.querySelector(".luxury-slider-prev");

    const nextButton =
        slider.querySelector(".luxury-slider-next");

    const dots =
        slider.querySelectorAll(".luxury-slider-dot");


    let currentSlide = 0;

    let autoplayTimer = null;

    let startX = 0;

    let isDragging = false;


    stage.innerHTML = "";


    images.forEach(function (image, index) {

        const slide =
            document.createElement("div");

        slide.className = "luxury-slide";


        const link =
            document.createElement("a");

        link.href =
            window.PAGE_BASE + "product.html?id=" + image.id;

        var product = typeof getProductById === "function" ? getProductById(image.id) : null;

        link.setAttribute(
            "aria-label",
            "View " + (product ? product.name : "watch") + " details"
        );


        const img =
            document.createElement("img");

        img.src = image.src;

        img.alt =
            (product ? product.name : "ALBERTO WATCHES Luxury Product") + " " + (index + 1);

        img.draggable = false;


        link.appendChild(img);

        slide.appendChild(link);

        stage.appendChild(slide);

    });


    const slides =
        stage.querySelectorAll(".luxury-slide");


    function normalizeIndex(index) {

        if (index < 0) {
            return images.length - 1;
        }

        if (index >= images.length) {
            return 0;
        }

        return index;
    }

    function renderSlider() {

        slides.forEach(function (slide) {

            slide.classList.remove(
                "luxury-slide-prev",
                "luxury-slide-active",
                "luxury-slide-next"
            );

        });


        const previousIndex =
            normalizeIndex(currentSlide - 1);

        const nextIndex =
            normalizeIndex(currentSlide + 1);


        slides[previousIndex]
            .classList.add("luxury-slide-prev");


        slides[currentSlide]
            .classList.add("luxury-slide-active");


        slides[nextIndex]
            .classList.add("luxury-slide-next");


        dots.forEach(function (dot, index) {

            dot.classList.toggle(
                "luxury-dot-active",
                index === currentSlide
            );

        });

    }


    function goToSlide(index) {

        currentSlide =
            normalizeIndex(index);

        renderSlider();

        restartAutoplay();

    }


    function nextSlide() {

        goToSlide(currentSlide + 1);

    }

    function previousSlide() {

        goToSlide(currentSlide - 1);

    }


    nextButton.addEventListener(
        "click",
        function () {

            nextSlide();

        }
    );


    previousButton.addEventListener(
        "click",
        function () {

            previousSlide();

        }
    );


    dots.forEach(function (dot) {

        dot.addEventListener(
            "click",
            function () {

                const index =
                    Number(
                        dot.dataset.slide
                    );

                goToSlide(index);

            }
        );

    });

    function startAutoplay() {

        autoplayTimer =
            setInterval(
                function () {

                    nextSlide();

                },
                2000
            );

    }


    function restartAutoplay() {

        clearInterval(
            autoplayTimer
        );

        startAutoplay();

    }


    slider.addEventListener(
        "touchstart",
        function (event) {

            startX =
                event.touches[0].clientX;

            isDragging = true;

        },
        { passive: true }
    );


    slider.addEventListener(
        "touchend",
        function (event) {

            if (!isDragging) return;

            isDragging = false;


            const endX =
                event.changedTouches[0].clientX;


            const distance =
                endX - startX;


            if (Math.abs(distance) < 50) {
                return;
            }


            if (distance < 0) {

                nextSlide();

            } else {

                previousSlide();

            }

        },
        { passive: true }
    );


    slider.addEventListener(
        "mousedown",
        function (event) {

            if (
                event.target.closest(
                    ".luxury-slider-btn, .luxury-slider-dot"
                )
            ) {
                return;
            }

            startX =
                event.clientX;

            isDragging = true;

        }
    );


    slider.addEventListener(
        "mouseup",
        function (event) {

            if (!isDragging) return;

            isDragging = false;


            const distance =
                event.clientX - startX;


            if (Math.abs(distance) < 50) {
                return;
            }


            if (distance < 0) {

                nextSlide();

            } else {

                previousSlide();

            }

        }
    );

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "ArrowRight") {

                nextSlide();

            }

            if (event.key === "ArrowLeft") {

                previousSlide();

            }

        }
    );


    renderSlider();

    startAutoplay();

});

function markActiveNav() {
  var path = window.location.pathname.split("/").pop() || "index.html";
  var currentCat = new URLSearchParams(window.location.search).get("cat");

  $(".alberto-nav .nav-link").each(function () {
    var $link = $(this);
    var href = $link.attr("href") || "";
    var hrefPath = href.split("?")[0].split("/").pop();
    var hrefCat = new URLSearchParams(href.split("?")[1] || "").get("cat");

    var isActive = false;
    if (hrefPath === path) {
      isActive = hrefCat ? (currentCat === hrefCat) : true;
    }
    $link.toggleClass("active", isActive);
  });
}


function wireDemoForms() {
  $(".js-newsletter-form").on("submit", function (e) {
    e.preventDefault();
    var email = $(this).find("input[type=email]").val();
    if (!email) return;
    showToast("Subscribed — welcome to ALBERTO WATCHES");
    this.reset();
  });

  $(".js-contact-form").on("submit", function (e) {
    e.preventDefault();
    showToast("Message sent — we'll reply within a day");
    this.reset();
  });
}

$(function () {
  markActiveNav();
  updateCartBadge();
  wireDemoForms();

  $(document).on("click", ".js-quick-add", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = $(this).data("id");
    if ($("body").hasClass("home-experience")) {
      // Home page: one click adds straight to the bag (no modal)
      addToCart(id, 1);
    } else {
      openQuickAddModal(id);
    }
  });
});


function initNavScroll() {
  var $nav = $("#albertoNav");
  if ($nav.length === 0) return;

  function onScroll() {
    if (window.scrollY > 30) { $nav.addClass("scrolled"); }
    else { $nav.removeClass("scrolled"); }
  }
  onScroll();
  $(window).on("scroll", onScroll);
}

function initMobileNav() {
  var $toggle = $("#mobileMenuToggle");
  var $panel = $("#navMain");
  if ($toggle.length === 0 || $panel.length === 0) return;

  function closePanel() {
    $panel.removeClass("open");
    $toggle.attr("aria-expanded", "false");
    $(".has-dropdown").removeClass("open");
    $(".dropdown-caret").attr("aria-expanded", "false");
  }

  $toggle.on("click", function () {
    var open = $panel.hasClass("open");
    if (open) { closePanel(); }
    else { $panel.addClass("open"); $toggle.attr("aria-expanded", "true"); }
  });

  $panel.on("click", ".nav-link", function () {
    if (window.innerWidth < 992) { closePanel(); }
  });
}

function initDropdowns() {
  $(".dropdown-caret").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $item = $(this).closest(".has-dropdown");
    var isOpen = $item.hasClass("open");

    if (window.innerWidth < 992) {
      $(".has-dropdown").not($item).removeClass("open");
      $(".dropdown-caret").not(this).attr("aria-expanded", "false");
    }
    $item.toggleClass("open", !isOpen);
    $(this).attr("aria-expanded", (!isOpen).toString());
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".has-dropdown").length && window.innerWidth >= 992) {
      $(".has-dropdown").removeClass("open");
      $(".dropdown-caret").attr("aria-expanded", "false");
    }
  });
}

function initHeroParticles() {
  var $field = $("#heroParticles");
  if ($field.length === 0) return;
  var colors = ["#ffffff", "#bbaeff", "#9dcbff"];
  var count = 16;

  for (var i = 0; i < count; i++) {
    var size = (Math.random() * 3 + 2).toFixed(1);
    var top = (Math.random() * 100).toFixed(1);
    var left = (Math.random() * 100).toFixed(1);
    var duration = (Math.random() * 5 + 6).toFixed(1);
    var delay = (Math.random() * 4).toFixed(1);
    var driftX = (Math.random() * 24 - 12).toFixed(0) + "px";
    var driftY = (Math.random() * -30 - 10).toFixed(0) + "px";
    var color = colors[i % colors.length];

    $('<span class="hero-particle"></span>')
      .css({
        width: size + "px",
        height: size + "px",
        top: top + "%",
        left: left + "%",
        background: color,
        opacity: (Math.random() * 0.35 + 0.15).toFixed(2),
        "--drift-x": driftX,
        "--drift-y": driftY,
        "animation-duration": duration + "s",
        "animation-delay": delay + "s"
      })
      .appendTo($field);
  }
}

function initHeroParallax() {
  var $hero = $("#hero");
  var $frame = $("#productFrame");
  var $cards = $(".float-card");
  if ($hero.length === 0 || $frame.length === 0) return;

  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canHover || reduceMotion) return;

  $hero.on("mousemove", function (e) {
    var rect = this.getBoundingClientRect();
    var relX = (e.clientX - rect.left) / rect.width - 0.5;
    var relY = (e.clientY - rect.top) / rect.height - 0.5;

    $frame.css("transform", "translate(" + (relX * 8).toFixed(1) + "px, " + (relY * 8).toFixed(1) + "px)");
    $cards.each(function (i) {
      var factor = 6 + i * 3;
      $(this).css("transform", "translate(" + (relX * factor).toFixed(1) + "px, " + (relY * factor).toFixed(1) + "px)");
    });
  });

  $hero.on("mouseleave", function () {
    $frame.css("transform", "");
    $cards.css("transform", "");
  });
}


function initSearch() {
  var $toggle = $("#searchToggle");
  if ($toggle.length === 0) return;
  if (typeof PRODUCTS === "undefined") return;

  var $wrap = $toggle.parent();
  if ($wrap.css("position") === "static") { $wrap.css("position", "relative"); }

  if ($("#albertoSearchStyles").length === 0) {
    $("head").append(
      '<style id="albertoSearchStyles">' +
        '@keyframes albertoSearchIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }' +
        '#albertoSearchBox.open { display:block !important; animation: albertoSearchIn .22s cubic-bezier(.16,1,.3,1); }' +
        '#albertoSearchBox .search-input-row { position:relative; }' +
        '#albertoSearchBox .search-icon-inline { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; opacity:0.45; pointer-events:none; }' +
        '#albertoSearchInput { transition: border-color .18s ease, box-shadow .18s ease; }' +
        '#albertoSearchInput:focus { outline:none; border-color:#6c5ab8 !important; box-shadow:0 0 0 3px rgba(108,90,184,0.18); }' +
        '.kairos-search-suggest-item { transition: background .12s ease, transform .12s ease; }' +
        '.kairos-search-suggest-item:hover { background:#f3f0ff !important; transform:translateX(2px); }' +
        '.kairos-search-suggest-item img { transition: transform .18s ease; }' +
        '.kairos-search-suggest-item:hover img { transform:scale(1.08); }' +
      '</style>'
    );
  }

  var $box = $(
    '<form id="albertoSearchBox" style="display:none; position:absolute; top:100%; right:0; margin-top:10px; background:#ffffff; border:1px solid #e5e2f0; border-radius:10px; padding:10px; box-shadow:0 12px 32px rgba(20,21,26,0.28); z-index:80;">' +
      '<div class="search-input-row">' +
        '<svg class="search-icon-inline" viewBox="0 0 24 24" fill="none" stroke="#6c5ab8" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
        '<input type="text" id="albertoSearchInput" placeholder="Search watches…" autocomplete="off" ' +
          'style="border:1.5px solid #e5e2f0; border-radius:8px; padding:9px 12px 9px 34px; font-family:inherit; font-size:0.85rem; width:230px; box-sizing:border-box; color:#14151a; background:#ffffff;">' +
      '</div>' +
      '<div id="albertoSearchSuggest" style="display:none; margin-top:8px; max-height:280px; overflow-y:auto;"></div>' +
    '</form>'
  );
  $wrap.append($box);
  var $input = $box.find("#albertoSearchInput");
  var $suggest = $box.find("#albertoSearchSuggest");

  function matchProducts(q) {
    q = q.toLowerCase();
    return PRODUCTS.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
        p.category.toLowerCase().indexOf(q) !== -1 ||
        p.movement.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);
  }

  function renderSuggestions(q) {
    if (!q) { $suggest.hide().empty(); return; }
    var matches = matchProducts(q);
    if (matches.length === 0) {
      $suggest.html('<div style="padding:8px 10px; font-size:0.8rem; color:#8a84a3;">No watches found</div>').show();
      return;
    }
    var html = matches.map(function (p) {
      return (
        '<a href="' + window.PAGE_BASE + 'product.html?id=' + p.id + '" class="kairos-search-suggest-item" ' +
          'style="display:flex; align-items:center; gap:10px; padding:6px 8px; text-decoration:none; border-radius:3px;">' +
          '<img src="' + imgUrl(p.seed, 80) + '" alt="" style="width:38px; height:38px; object-fit:cover; border-radius:2px; flex-shrink:0;">' +
          '<span style="min-width:0;">' +
            '<span style="display:block; font-size:0.85rem; font-weight:600; color:#14151a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + p.name + '</span>' +
            '<span style="display:block; font-size:0.75rem; color:#6b6580;">' + formatPKR(p.price) + '</span>' +
          '</span>' +
        '</a>'
      );
    }).join("");
    html += '<button type="submit" style="width:100%; text-align:left; background:none; border:0; border-top:1px solid #ece9f5; ' +
      'margin-top:4px; padding:8px; font-size:0.78rem; color:#5a4fcf; cursor:pointer;">See all results for "' +
      $("<div>").text(q).html() + '" →</button>';
    $suggest.html(html).show();

    $suggest.find(".kairos-search-suggest-item").on("mouseenter", function () {
      $(this).css("background", "#f6f4fc");
    }).on("mouseleave", function () {
      $(this).css("background", "transparent");
    });
  }

  $toggle.on("click", function (e) {
    e.preventDefault();
    $box.toggleClass("open");
    if ($box.hasClass("open")) { $input.trigger("focus"); }
  });

  $input.on("input", function () {
    renderSuggestions($(this).val().trim());
  });

  $box.on("submit", function (e) {
    e.preventDefault();
    var q = $input.val().trim();
    if (!q) return;
    window.location.href = window.PAGE_BASE + "shop.html?q=" + encodeURIComponent(q);
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#albertoSearchBox, #searchToggle").length) {
      $box.removeClass("open");
      $suggest.hide().empty();
    }
  });
}

$(function () {
  initNavScroll();
  initMobileNav();
  initDropdowns();
  initHeroParticles();
  initHeroParallax();
  initSearch();
});
