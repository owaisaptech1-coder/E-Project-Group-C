$(function () {
  var id = getQueryParam("id") || PRODUCTS[0].id;
  var p = getProductById(id) || PRODUCTS[0];

  document.title = p.name + " — ALBERTO WATCHES";

  $("#pdMainImg").attr("src", imgUrl(p.gallery[0], 800)).attr("alt", p.name);
  var thumbHtml = p.gallery.map(function (seed, i) {
    return '<img src="' + imgUrl(seed, 200) + '" class="' + (i === 0 ? "active" : "") + '" data-full="' + imgUrl(seed, 800) + '" alt="' + p.name + " view " + (i + 1) + '">';
  }).join("");
  $("#pdThumbs").html(thumbHtml);

  $("#pdTag").text(p.tag || "").toggle(!!p.tag);
  $("#pdBreadcrumbName").text(p.name);
  $("#pdCategory").text(p.category.charAt(0).toUpperCase() + p.category.slice(1) + " · " + p.movement);
  $("#pdName").text(p.name);
  $("#pdBlurb").text(p.blurb);
  $("#pdPrice").text(formatPKR(p.price));
  if (p.compareAt) {
    $("#pdCompare").text(formatPKR(p.compareAt)).show();
    var pct = Math.round((1 - p.price / p.compareAt) * 100);
    $("#pdDiscount").text(pct + "% off").show();
  } else {
    $("#pdCompare, #pdDiscount").hide();
  }

  $("#specCase").text(p.case);
  $("#specStrap").text(p.strap);
  $("#specMovement").text(p.movement);
  $("#specWarranty").text("1 year, international");

  $(document).on("click", "#pdThumbs img", function () {
    $("#pdThumbs img").removeClass("active");
    $(this).addClass("active");
    $("#pdMainImg").attr("src", $(this).data("full"));
  });

  
  $("#qtyMinus").on("click", function () {
    var v = Math.max(1, parseInt($("#qtyInput").val(), 10) - 1);
    $("#qtyInput").val(v);
  });
  $("#qtyPlus").on("click", function () {
    var v = parseInt($("#qtyInput").val(), 10) + 1;
    $("#qtyInput").val(v);
  });

  $("#addToCartBtn").on("click", function () {
    var qty = parseInt($("#qtyInput").val(), 10) || 1;
    addToCart(p.id, qty);
  });


  var related = PRODUCTS.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 4);
  if (related.length < 4) {
    var extra = PRODUCTS.filter(function (x) { return x.id !== p.id && related.indexOf(x) === -1; });
    related = related.concat(extra).slice(0, 4);
  }
  renderProductGrid($("#relatedGrid"), related);
});
