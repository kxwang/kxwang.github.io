///////////////////////////////////////
// Helper functions
///////////////////////////////////////
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

//////////////////////////////////////////////////
// Base layers
//////////////////////////////////////////////////
var esriGray = L.esri.basemapLayer('Gray'),
    esriGrayLabels = L.esri.basemapLayer('GrayLabels'),
    esriStreets = L.esri.basemapLayer('Streets');
var baseMaps = {
    'Gray': esriGray,
    //'esriGrayLabels': esriGrayLabels,
    'Streets': esriStreets
};

var marker;

// https://gis.oregonmetro.gov/rlisapi2/#jsapi/autoSuggest
var x = new RLIS.Autosuggest("user-address",
    { "mode": 'query', 'entries': 5 },
    function (result, error) {
        if (error) {
            console.error(error);
            return;
        }

        if (result.length == 0) return;

        console.log(JSON.stringify(result, null, ' '));

        var queryResult = result[0];

        if (queryResult.status == 'failure') return;

        if (marker) marker.removeFrom(map);
        map.flyTo(new L.LatLng(queryResult.lat, queryResult.lng), 13);
        marker = L.marker([queryResult.lat, queryResult.lng]).addTo(map);

        var affectedPolygonArray = leafletPip.pointInLayer([queryResult.lng, queryResult.lat], customMapLayer, true)

        if (affectedPolygonArray.length > 0) {
            $('#result').text('This address is affected');
        }
        else {
            $('#result').text('This address is NOT affected');
        }
    },
    'status,lng,lat,fullAddress,jurisCity,county,zipcode'
);

//////////////////////////////////////////////////
// Overlay layers
//////////////////////////////////////////////////

var waterDistrictNameAndID = {};
var waterDistrictLayer = L.esri.featureLayer({
    url: "https://www.portlandmaps.com/arcgis/rest/services/Public/Utilities_Water/MapServer/6",
    simplifyFactor: 0.35,
    precision: 5,
    style: {
        color: "#999",
        weight: 1,
        fillOpacity: 0.0,
        zIndex: 0,
    },
    onEachFeature: function (feature, layer) {
        waterDistrictNameAndID[feature.properties.DISTRICT] = feature.id;
        // events
        layer.on({
            mouseover: function () {
                if (isWaterDistrictSelected(feature.id)) return;
                this.setStyle({
                    'fillColor': '#b45501',
                    fillOpacity: 0.5,
                });
            },
            mouseout: function () {
                if (isWaterDistrictSelected(feature.id)) return;
                this.setStyle({
                    'fillColor': '#f0d1b1',
                    fillOpacity: 0,
                });
            },
        });
        layer.bindTooltip(feature.properties.DISTRICT, {
            //permanent: true,
            direction: 'center',
            offset: L.point(0, 0), // To display Multnomah properly
            className: 'distrctLabel'
        });
    }
}).on('load', function () {
    console.log('feature layer ready');
    // skip if the select control is already filled
    if (document.getElementById('water-districts').options.length > 0) return;
    // Initialize the water district multi-select list
    var $dropdown = $("#water-districts");
    for (var waterDistrictName in waterDistrictNameAndID) {
        $dropdown.append($("<option />").val(waterDistrictNameAndID[waterDistrictName]).text(waterDistrictName));
    }
})

var overlayMaps = {
    //'Oregon': countiesLayer,
    'Water District': waterDistrictLayer,
}


// initialize the map
var map = L.map('map-water-advisory', {
    center: [45.426407377512774, -122.70355224609376],
    zoom: 10,
    layers: [esriGray, waterDistrictLayer /*, esriGrayLabels*/]
}).on('click', function (ev) {
});

var customMapLayer = L.geoJSON(null, {
    style: {
        color: "#ee0000",
        weight: 2,
        fillOpacity: 0.2,
        zIndex: 0,
    },
});

var gFile;
function handleFiles(files) {
    if (files.length == 0) return;

    var file = files[0];
    gFile = file;
    if (file.size > 2 * 1024 * 1024) return;

    var reader = new FileReader();

    if (file.name.endsWith('.geojson')) {
        reader.onload = function (e) {
            customMapLayer.clearLayers()
            customMapLayer.addData(JSON.parse(reader.result)).addTo(map);
        }
        reader.readAsText(file);
    }
    else if (file.name.endsWith('.zip')) {
        reader.onload = function (e) {
            // Convert shapefile binary into geojson text
            shp(reader.result).then(function (geojson) {
                customMapLayer.clearLayers()
                customMapLayer.addData(geojson).addTo(map);
            })
        }
        reader.readAsArrayBuffer(file);
    }
    else if (file.name.endsWith('.json')) {
        reader.onload = function (e) {
            esri2geo.toGeoJSON(JSON.parse(reader.result), function (err, geoJson) {
                customMapLayer.clearLayers()
                customMapLayer.addData(geoJson).addTo(map);
            });
        }
        reader.readAsText(file);
    }
    else {
        console.error('File type is not supported');
    }
}

var layerControl = L.control.layers(baseMaps, overlayMaps /*, { autoZIndex: false }*/).addTo(map);

$(function () {
    console.log('document ready');
})

function isWaterDistrictSelected(featureId) {
    var waterDistrictList = document.getElementById('water-districts');

    for (var i = 0; i < waterDistrictList.length; i++) {
        if (waterDistrictList.options[i].value == featureId
            && waterDistrictList.options[i].selected) {
            return true;
        }
    }
    return false;
}

function districtSelected(waterDistrictList) {
    for (var i = 0; i < waterDistrictList.length; i++) {
        if (waterDistrictList.options[i].selected) {
            waterDistrictLayer.setFeatureStyle(waterDistrictList.options[i].value, {color: 'red', fillOpacity: 0.2, weight: 2});
            // waterDistrictLayer.getFeature(waterDistrictList.options[i].value).setStyle({
            //     color: "#ee0000",
            //     weight: 2,
            //     fillOpacity: 0.2,
            //     zIndex: 0,
            // });
            // customMapLayer.addLayer(waterDistrictLayer.getFeature(waterDistrictList.options[i].value));
        }
        else {
            waterDistrictLayer.setFeatureStyle(waterDistrictList.options[i].value, {
                color: "#999",
                weight: 1,
                fillOpacity: 0.0,
                zIndex: 0,
            });
            // waterDistrictLayer.getFeature(waterDistrictList.options[i].value).resetStyle();
            // customMapLayer.removeLayer(waterDistrictLayer.getFeature(waterDistrictList.options[i].value));
        }
    }
}