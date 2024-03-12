// Get query string by key
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

function getColor(d) {
    return d > 3000  ? '#800026' :
           d > 1500  ? '#E31A1C' :
           d > 750  ? '#FC4E2A' :
           d > 325   ? '#FD8D3C' :
           d > 163   ? '#FEB24C' :
           d > 81   ? '#FFEDA0' :
           d >= 0   ? '#ffffff' :
                      '#00008b';
}

function style(feature) {
    // g_diff_json
    // "Precinct": "p4402",

    if( g_diff_json[feature.properties.FIRST_PREC] === undefined) {
        console.log("missing " + feature.properties.FIRST_PREC);
        return {
            fillColor: "#333333",
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }
    return {
        fillColor: getColor(g_diff_json[feature.properties.FIRST_PREC]["diff"]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


// 2022
// https://services5.arcgis.com/x7DNZL1YqNQVNykA/arcgis/rest/services/Elections_PrecinctsSplits_Feb2022/FeatureServer/0
// 2020?
// https://www3.multco.us/arcgispublic/rest/services/Elections/VotingDistrictInfo_2020/MapServer/1

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
    2022
  "OBJECTID": 230,
  "House_District": "House District 44",
  "Senate_District": "Senate District 22",
  "METRO": "Metro District 5",
  "MultCo_Commissioner": "Multnomah Co Commissioner District 2",
  "Congressional_District": "Congressional District 3",
  "Precinct": "p4402",
  "Split": "A",
  "Precinct_Split": "p4402.A",

  2020
    "OBJECTID": 49,
  "FIRST_PREC": "4404",
  "Shape_Length": 38966.6177006268,
  "Shape_Area": 70628804.48680311,
  "Color": 1,
  "STATE_REPR": "House District 44"
    */
    featureLayer.bindPopup(function (layer) {
    //   return "<pre>" + JSON.stringify(layer.feature.properties, null, 2) + "</pre>"
        let props = layer.feature.properties;
        return "Precinct: " + props.FIRST_PREC + "</br>"
            + "Total votes: " + g_diff_json[props.FIRST_PREC]["ttl"] + "</br>"
            + "Mike won by: " + g_diff_json[props.FIRST_PREC]["diff"];
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
        grades = [-100, 0, 81, 163, 325, 750, 1500, 3000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + ((grades[i + 1] !== undefined) ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};


var title = L.control({position: 'topright'});

title.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'title');
    div.innerHTML += "Multnomah 2020 Votes Won by Mike Schmidt";
    return div;
};

var g_diff_json = null;
var map = L.map('layer').setView([45.5236111, -122.675], 7);

legend.addTo(map);
title.addTo(map);

$(document).ready(function () {

    // Get the map url from query string
    // var layerUrl = qs('url');
    // if (!layerUrl) return;
    var layerUrl = "https://www3.multco.us/arcgispublic/rest/services/Elections/VotingDistrictInfo_2020/MapServer/1"

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
            if (layer.type == 'Feature Layer') {
                fetch('/arcgis-browser/multco-2020-diff.json')
                    .then((response) => response.json())
                    .then((json) => {
                        g_diff_json = json;
                        loadFeatureLayer(layerUrl);
                    });
            }
            else if (layer.type == 'Group Layer') {
            }
            else {
                loadTileLayer(layerUrl);
            }
        }
    });
});
