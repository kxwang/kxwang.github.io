// Get query string by key
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

// Load a feature layer into the DIV
function loadFeatureLayer(layerUrl) {
    var map = L.map('layer').setView([45.5236111, -122.675], 15);

    // L.esri.basemapLayer('Streets').addTo(map);
    L.esri.tiledMapLayer({
        url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer'
    }).addTo(map);

    // a Leaflet marker is used by default to symbolize point features.
    var featureLayer = L.esri.featureLayer({
        url: layerUrl,
        where: ''
    }).addTo(map);
    
    featureLayer.bindPopup(function (layer) {
      return JSON.stringify(layer.feature.properties, null, 4)
    });
    // featureLayer.query().bounds(function (error, latlngbounds) {
    //     if (error) {
    //         console.error(error);
    //         return;
    //     }

    //     map.fitBounds(latlngbounds);
    // });
}

$(document).ready(function () {

    // Get the map url from query string
    var layerUrl = qs('url');
    if (!layerUrl) return;

    // Get the layer description in JSON
    $.ajax({
        dataType: "json",
        url: layerUrl,
        data: {
            f: 'json',
        },
        success: function (layer) {
            if (!layer.name) {
                console.error('No layer found');
                return;
            }

            /*
            "id": 6,
            "name": "Regional Drinking Water Advisory Boundary",
            "type": "Feature Layer",
            "description": "",
            "geometryType": "esriGeometryPolygon",
            "fields": [
                {
                    "name": "OBJECTID",
                    "type": "esriFieldTypeOID",
                    "alias": "OBJECTID",
                    "domain": null
                },
                {
                    "name": "PhoneNo",
                    "type": "esriFieldTypeString",
                    "alias": "PhoneNo",
                    "length": 20,
                    "domain": null
                },
                */
            if (layer.type == 'Feature Layer') {
                loadFeatureLayer(layerUrl);
            }
            else if (layer.type == 'Group Layer') {
            }
            else {
                loadTileLayer(layerUrl);
            }
        }
    });
});
