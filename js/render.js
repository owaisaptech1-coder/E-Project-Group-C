
function productCardHTML(p) {
  var compare = p.compareAt
    ? '<span class="price-compare">' + formatPKR(p.compareAt) + "</span>"
    : "";
  var hoverCompare = p.compareAt
    ? ' <span class="phi-compare">' + formatPKR(p.compareAt) + "</span>"
    : "";
  var hoverBlurb = p.blurb ? '<p class="phi-blurb">' + p.blurb + "</p>" : "";
  var tag = p.tag ? '<span class="tag-pill">' + p.tag + "</span>" : "";
  return (
    '<div class="col-6 col-md-4 col-lg-3">' +
      '<div class="product-card">' +
        tag +
        '<a href="' + window.PAGE_BASE + 'product.html?id=' + p.id + '" class="thumb d-block">' +
          '<img src="' + imgUrl(p.seed, 500) + '" alt="' + p.name + ' — ' + p.case + '" loading="lazy">' +
          '<div class="product-hover-info">' +
            '<p class="phi-eyebrow">' + p.category + " &middot; " + p.movement + "</p>" +
            '<h4 class="phi-name">' + p.name + "</h4>" +
            '<p class="phi-specs">' + p.case + " &middot; " + p.strap + "</p>" +
            hoverBlurb +
            '<div class="phi-price">' + formatPKR(p.price) + hoverCompare + "</div>" +
          "</div>" +
        "</a>" +
        '<div class="body">' +
          '<div class="cat-eyebrow">' + p.category + " &middot; " + p.movement + "</div>" +
          '<h3><a href="' + window.PAGE_BASE + 'product.html?id=' + p.id + '">' + p.name + "</a></h3>" +
          '<div class="price-row">' +
            '<span class="price-now">' + formatPKR(p.price) + "</span>" +
            compare +
          "</div>" +
          '<button type="button" class="quick-add js-quick-add" data-id="' + p.id + '">Quick Add</button>' +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

function renderProductGrid($target, list) {
  if (list.length === 0) {
    $target.html('<div class="col-12 text-center text-slate py-5 font-mono">No watches match those filters.</div>');
    return;
  }
  $target.html(list.map(productCardHTML).join(""));
}
