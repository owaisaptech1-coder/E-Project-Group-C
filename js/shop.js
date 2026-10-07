function getQueryParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

$(function () {
  var $grid = $("#shopGrid");
  var $count = $("#resultCount");
  var $sort = $("#sortSelect");

  var initialCat = getQueryParam("cat");
  var urlCatMatchesCheckbox = false;
  if (initialCat) {
    var $matchingCheckbox = $('.js-cat-filter[value="' + initialCat + '"]');
    if ($matchingCheckbox.length) {
      $matchingCheckbox.prop("checked", true);
      urlCatMatchesCheckbox = true;
    }
  }

  var searchQuery = (getQueryParam("q") || "").trim().toLowerCase();
  if (searchQuery) {
    $count.before(
      '<p class="text-slate mb-2" style="font-size:0.85rem;">Showing results for "<strong>' +
        $("<div>").text(searchQuery).html() +
        '</strong>" — <a href="shop.html" style="color:inherit;">clear search</a></p>'
    );
  }

  function activeCats() {
    var checked = $(".js-cat-filter:checked").map(function () { return $(this).val(); }).get();
    if (initialCat && !urlCatMatchesCheckbox && checked.length === 0) {
      return [initialCat];
    }
    return checked;
  }

  function activeMovements() {
    return $(".js-mv-filter:checked").map(function () { return $(this).val(); }).get();
  }

  function applyFilters() {
    var cats = activeCats();
    var movements = activeMovements();
    var maxPrice = parseInt($("#priceRange").val(), 10);

    var list = PRODUCTS.filter(function (p) {
      var catOk = cats.length === 0 ||
        cats.indexOf(p.collection || p.category) !== -1 ||
        cats.indexOf(p.category) !== -1;
      var mvOk = movements.length === 0 || movements.some(function (m) { return p.movement.toLowerCase().indexOf(m) !== -1; });
      var priceOk = p.price <= maxPrice;
      var searchOk = !searchQuery ||
        p.name.toLowerCase().indexOf(searchQuery) !== -1 ||
        p.category.toLowerCase().indexOf(searchQuery) !== -1 ||
        p.movement.toLowerCase().indexOf(searchQuery) !== -1;
      return catOk && mvOk && priceOk && searchOk;
    });

    var sortVal = $sort.val();
    if (sortVal === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (sortVal === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (sortVal === "name-asc") list.sort(function (a, b) { return a.name.localeCompare(b.name); });

    renderProductGrid($grid, list);
    $count.text(list.length + (list.length === 1 ? " watch" : " watches"));
  }

  $(".js-cat-filter, .js-mv-filter, #sortSelect").on("change", applyFilters);
  $("#priceRange").on("input", function () {
    $("#priceRangeVal").text(formatPKR(parseInt($(this).val(), 10)));
    applyFilters();
  });
  $("#clearFilters").on("click", function () {
    $(".js-cat-filter, .js-mv-filter").prop("checked", false);
    $("#priceRange").val(60000);
    $("#priceRangeVal").text(formatPKR(60000));
    $sort.val("featured");
    applyFilters();
  });

  applyFilters();
});
