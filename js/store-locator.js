(function () {
  var demoLocations = [
    { id: "lahore", name: "ALBERTO Studio / Lahore", lat: 31.5204, lng: 74.3587, detail: "Demo location only. Replace with a verified ALBERTO CLOCKS address before launch." },
    { id: "karachi", name: "ALBERTO Studio / Karachi", lat: 24.8607, lng: 67.0011, detail: "Demo location only. Replace with a verified ALBERTO CLOCKS address before launch." },
    { id: "islamabad", name: "ALBERTO Studio / Islamabad", lat: 33.6844, lng: 73.0479, detail: "Demo location only. Replace with a verified ALBERTO CLOCKS address before launch." }
  ];

  function initStoreLocator() {
    var mapElement = document.getElementById("storeLocatorMap");
    if (!mapElement || typeof L === "undefined") return;

    var map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true }).setView([29.8, 70.8], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    var markerById = {};
    var cards = document.querySelectorAll(".locator-store-card");
    var activeCard = function (id) {
      cards.forEach(function (card) { card.classList.toggle("is-active", card.dataset.storeId === id); });
    };

    demoLocations.forEach(function (location) {
      var marker = L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup('<div class="locator-popup-title">' + location.name + '</div><p class="locator-popup-copy">' + location.detail + '</p>');
      marker.on("click", function () { activeCard(location.id); });
      markerById[location.id] = marker;
    });

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        var location = demoLocations.find(function (item) { return item.id === card.dataset.storeId; });
        if (!location) return;
        activeCard(location.id);
        map.setView([location.lat, location.lng], 12, { animate: true });
        markerById[location.id].openPopup();
      });
    });

    var findButton = document.getElementById("findAStore");
    if (findButton) {
      findButton.addEventListener("click", function () {
        mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(function () { map.invalidateSize(); map.setView([29.8, 70.8], 5, { animate: true }); }, 450);
      });
    }

    window.addEventListener("resize", function () { map.invalidateSize(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initStoreLocator);
  else initStoreLocator();
})();
