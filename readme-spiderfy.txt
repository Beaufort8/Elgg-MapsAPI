/* 
http://stackoverflow.com/questions/35569748/overlapping-pointers-with-markerclustererplus-and-overlappingmarkerspiderfier
http://jsfiddle.net/geocodezip/gL3L7zso/159/
other solution
https://github.com/jawj/OverlappingMarkerSpiderfier/issues/30 

manipulations in

- oms.min.js (new lib)
- amap_maps_api/views/deafault/amap_maps_api/global.php
- amap_maps_api/views/deafault/amap_maps_api/amap_search.js

*/

var geoJson = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "name": "Bielefeld"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.528849, 52.030656]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Bielefeld2"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.528849, 52.030656]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Bielefeld3"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.528849, 52.030656]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Herford"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.676780, 52.118003]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Guetersloh"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.383353, 51.902917]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Guetersloh2"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [8.38, 51.9]
    }
  }]
};
var map = null;
var bounds = new google.maps.LatLngBounds();

var boxText = document.createElement("div");
boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: yellow; padding: 5px;";
var infobox = new InfoBox({
  content: boxText,
  disableAutoPan: false,
  maxWidth: 0,
  pixelOffset: new google.maps.Size(-140, 0),
  zIndex: null,
  boxStyle: {
    background: "url('tipbox.gif') no-repeat",
    opacity: 0.75,
    width: "280px"
  },
  closeBoxMargin: "10px 2px 2px 2px",
  closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
  infoBoxClearance: new google.maps.Size(1, 1),
  isHidden: false,
  pane: "floatPane",
  enableEventPropagation: false
});

var markerClusterer = new MarkerClusterer(map,[],{imagePath:"https://cdn.rawgit.com/googlemaps/v3-utility-library/master/markerclustererplus/images/m"});
minClusterZoom = 14;
markerClusterer.setMaxZoom(minClusterZoom);

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(52, 8),
    zoom: 4
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  
  google.maps.event.addListenerOnce(map, 'idle', function() {
    var oms = new OverlappingMarkerSpiderfier(map, {
      markersWontMove: true,
      markersWontHide: true,
      keepSpiderfied: true
    });
    oms.addListener('unspiderfy', function(spidered, unspidered) {
      for (var i = 0; i < spidered.length; i++) {
        spidered[i].setLabel("" + (i + 1));
        spidered[i].setOptions({
          zIndex: i
        });
      }
    });

    markerClusterer.setMap(map);
    google.maps.event.addListener(map.data, 'addfeature', function(e) {
      if (e.feature.getGeometry().getType() === 'Point') {
        var marker = new google.maps.Marker({
          position: e.feature.getGeometry().get(),
          title: e.feature.getProperty('name'),
          map: map
        });
        google.maps.event.addListener(marker, 'click', function(marker, e) {
          return function() {

            var myHTML = e.feature.getProperty('name');
            boxText.innerHTML = "<div style='text-align: center;'><b>" + myHTML + "</b></div>";
            infobox.setPosition(e.feature.getGeometry().get());
            infobox.setOptions({
              pixelOffset: new google.maps.Size(0, 0)
            });
            infobox.open(map);
          };
        }(marker, e));
        markerClusterer.addMarker(marker);
        oms.addMarker(marker);
        var markersNear = oms.markersNearMarker(marker, false);
        marker.setLabel("" + (markersNear.length + 1));
        marker.setOptions({
          zIndex: markersNear.length
        });

        bounds.extend(e.feature.getGeometry().get());
        map.fitBounds(bounds);
        map.setCenter(e.feature.getGeometry().get());
      }
    });
    layer = map.data.addGeoJson(geoJson);
    map.data.setMap(null);
    google.maps.event.addListener(map, "click", function() {
      infobox.close();
    });
  });
}
google.maps.event.addDomListener(window, 'load', initialize);

