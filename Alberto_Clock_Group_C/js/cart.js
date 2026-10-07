function renderCart() {
  var $lines = $("#cartLines");
  var $empty = $("#emptyCart");
  var $summary = $("#cartSummaryWrap");

  if (KAIROS_CART.length === 0) {
    $lines.empty();
    $summary.hide();
    $empty.show();
    return;
  }
  $empty.hide();
  $summary.show();

  var html = "";
  var subtotal = 0;

  KAIROS_CART.forEach(function (line) {
    var p = getProductById(line.id);
    if (!p) return;
    var lineTotal = p.price * line.qty;
    subtotal += lineTotal;
    html +=
      '<div class="cart-line d-flex gap-3 align-items-center" data-id="' + p.id + '">' +
        '<img src="' + imgUrl(p.seed, 200) + '" alt="' + p.name + '">' +
        '<div class="flex-grow-1">' +
          '<h3 style="font-size:1.05rem;" class="mb-1">' + p.name + "</h3>" +
          '<p class="text-slate font-mono mb-2" style="font-size:0.78rem;">' + p.case + "</p>" +
          '<div class="qty-stepper">' +
            '<button type="button" class="js-line-minus" aria-label="Decrease quantity">−</button>' +
            '<input type="text" class="js-line-qty" value="' + line.qty + '" readonly aria-label="Quantity">' +
            '<button type="button" class="js-line-plus" aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<div class="text-end">' +
          '<div class="font-mono fw-bold">' + formatPKR(lineTotal) + "</div>" +
          '<button type="button" class="js-line-remove btn btn-link btn-sm text-danger p-0 mt-1" style="font-family:var(--font-mono); font-size:0.72rem;">Remove</button>' +
        "</div>" +
      "</div>";
  });

  $lines.html(html);

  var shipping = subtotal > 0 ? 0 : 0; // free delivery
  var total = subtotal + shipping;

  $("#sumSubtotal").text(formatPKR(subtotal));
  $("#sumShipping").text(shipping === 0 ? "Free" : formatPKR(shipping));
  $("#sumTotal").text(formatPKR(total));
}

$(function () {
  renderCart();

  $(document).on("click", ".js-line-minus", function () {
    var id = $(this).closest(".cart-line").data("id");
    var line = KAIROS_CART.find(function (l) { return l.id === id; });
    if (!line) return;
    line.qty = Math.max(1, line.qty - 1);
    saveCart();
    updateCartBadge();
    renderCart();
  });

  $(document).on("click", ".js-line-plus", function () {
    var id = $(this).closest(".cart-line").data("id");
    var line = KAIROS_CART.find(function (l) { return l.id === id; });
    if (!line) return;
    line.qty = line.qty + 1;
    saveCart();
    updateCartBadge();
    renderCart();
  });

  $(document).on("click", ".js-line-remove", function () {
    var id = $(this).closest(".cart-line").data("id");
    KAIROS_CART = KAIROS_CART.filter(function (l) { return l.id !== id; });
    saveCart();
    updateCartBadge();
    renderCart();
  });

  $("#checkoutBtn").on("click", function (e) {
    e.preventDefault();
    if (KAIROS_CART.length === 0) return;
    window.location.href = "checkout.html";
  });
});
