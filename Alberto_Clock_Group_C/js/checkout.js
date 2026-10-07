(function () {
  var shipping = 0;

  function getCheckoutItems() {
    return KAIROS_CART.map(function (line) {
      var product = getProductById(line.id);
      return product ? { product: product, quantity: line.qty } : null;
    }).filter(Boolean);
  }

  function getTotals(items) {
    var subtotal = items.reduce(function (sum, item) { return sum + item.product.price * item.quantity; }, 0);
    return { subtotal: subtotal, shipping: subtotal > 0 ? shipping : 0, total: subtotal + (subtotal > 0 ? shipping : 0) };
  }

  function renderCheckout() {
    var items = getCheckoutItems();
    var empty = document.getElementById("checkoutEmpty");
    var content = document.getElementById("checkoutContent");
    var list = document.getElementById("checkoutItems");
    if (!items.length) {
      empty.hidden = false;
      content.hidden = true;
      return;
    }
    empty.hidden = true;
    content.hidden = false;
    list.innerHTML = items.map(function (item) {
      var product = item.product;
      return '<article class="checkout-item"><img src="' + imgUrl(product.seed, 200) + '" alt="' + product.name + '"><div><h3>' + product.name + '</h3><p>Quantity: ' + item.quantity + ' · ' + formatPKR(product.price) + ' each</p></div><span class="item-total">' + formatPKR(product.price * item.quantity) + '</span></article>';
    }).join("");
    var totals = getTotals(items);
    document.getElementById("checkoutSubtotal").textContent = formatPKR(totals.subtotal);
    document.getElementById("checkoutShipping").textContent = totals.shipping === 0 ? "Free" : formatPKR(totals.shipping);
    document.getElementById("checkoutTotal").textContent = formatPKR(totals.total);
  }

  function createOrderNumber() {
    return "ALB-" + Date.now().toString(36).toUpperCase().slice(-6) + "-" + Math.floor(Math.random() * 900 + 100);
  }

  function placeOrder(event) {
    event.preventDefault();
    var items = getCheckoutItems();
    var form = event.currentTarget;
    if (!items.length) {
      renderCheckout();
      return;
    }
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      form.reportValidity();
      return;
    }
    var totals = getTotals(items);
    document.getElementById("orderTotalValue").textContent = formatPKR(totals.total);
    document.getElementById("orderNumber").textContent = "Order " + createOrderNumber();
    document.getElementById("checkoutContent").hidden = true;
    document.getElementById("orderConfirmation").classList.add("is-visible");
    KAIROS_CART = [];
    saveCart();
    updateCartBadge();
  }

  $(function () {
    renderCheckout();
    $("#checkoutForm").on("submit", placeOrder);
    $("input[name=payment]").on("change", function () {
      $("#cardDemoNote").toggle($(this).val() === "card");
    });
  });
})();
