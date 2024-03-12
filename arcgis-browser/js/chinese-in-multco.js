// Get query string by key
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

function getColor(d) {
    return d > 640  ? '#800026' :
           d > 320  ? '#E31A1C' :
           d > 160  ? '#FC4E2A' :
           d > 80   ? '#FD8D3C' :
           d > 40   ? '#FEB24C' :
           d > 20   ? '#FFEDA0' :
                      '#ffffff';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.C16001_021),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Portland City Council Districts
// https://portlandmaps.com/arcgis/rest/services/Public/CGIS_Layers/MapServer/11

// Load a feature layer into the DIV
function loadFeatureLayer(layerUrl) {

    // L.esri.basemapLayer('Streets').addTo(map);
    L.esri.tiledMapLayer({
        url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer'
    }).addTo(map);

    // a Leaflet marker is used by default to symbolize point features.
    var featureLayer = L.esri.featureLayer({
        url: layerUrl,
        where: '',
        style: style,
    }).addTo(map);
    
    /*
"Name": "Census Tract 16.02, Multnomah County, Oregon",
  "C16001_001": 4435, // Total Population 5 Years And Over
  "C16001_002": 3213, // Speak only English
  "C16001_021": 359, // Chinese_Languages
  "C16001_022": 42, // Speak English "very well"
  "C16001_023": 317, // Speak English less than "very well"
  "LimitedEnglishSpeakingHH_All": 236 //LimitedEnglishSpeakingHH_All
    */
    featureLayer.bindPopup(function (layer) {
    //   return "<pre>" + JSON.stringify(layer.feature.properties, null, 2) + "</pre>"
        return "Total Population >5yo: " + layer.feature.properties.C16001_001 + "</br>"
            + "Chinese Speaking count: " + layer.feature.properties.C16001_021 + " (English not well: " + ((layer.feature.properties.C16001_021 == 0) ? "0%" : Math.floor(100*layer.feature.properties.C16001_023/layer.feature.properties.C16001_021) + "%") + ")</br>"
            + "Chinese Speaking %: " + Math.floor(100*layer.feature.properties.C16001_021/layer.feature.properties.C16001_001) + "%";
    });
    featureLayer.query().bounds(function (error, latlngbounds) {
        if (error) {
            console.error(error);
            return;
        }

        map.fitBounds(latlngbounds);
    });
}


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 20, 40, 80, 160, 320, 640],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};


var title = L.control({position: 'topright'});

title.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'title');
    div.innerHTML += "Multnomah County Chinese Speaking Population 2016";
    return div;
};

var map = L.map('layer').setView([45.5236111, -122.675], 7);

legend.addTo(map);
title.addTo(map);

$(document).ready(function () {

    // Get the map url from query string
    // var layerUrl = qs('url');
    // if (!layerUrl) return;
    var layerUrl = "https://www3.multco.us/arcgispublic/rest/services/Countywide/LanguageProficiency2016/MapServer/4";

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
