//////////////////////////////////////////////////
// Base layers
//////////////////////////////////////////////////

// load a tile layer
var lightLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    //'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        //attribution: 'Tiles by <a href="http://http://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 15,
        minZoom: 4,
        id: 'mapbox.light'
    });

var streetsLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    //'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        //attribution: 'Tiles by <a href="http://http://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 17,
        minZoom: 4,
        id: 'mapbox.streets'
    });

var baseMaps = {
    "Light": lightLayer,
    "Streets": streetsLayer
};

// initialize the map
var map = L.map('map', {
    center: [45.53, -122.68],
    zoom: 8,
    layers: [lightLayer]
});



//////////////////////////////////////////////////
// Overlay layers
//////////////////////////////////////////////////

// Filter out small delays
/*
odotCategoryID
    Event ID
    A Crash/Hazard
    C Construction Work
    CH Cancelled Herbicide Application
    CV Commercial Vehicle Information
    H Herbicide Application
    I Information
    M Maintenance Work
    T Traffic Congestion
    W Weather Impact

odotSeverityID
Severity ID
    0 Informational only
    1 Estimated delay < 20 minutes
    2 Estimated delay of 20 minutes - 2 hours
    3 Estimated delay of 2 hours or greater
    4 Closure
    5 Seasonal Closure
    6 Unconfirmed
    7 No to Minimum Delay
    8 Closure with Detour
*/



////////////////////////////////////////////////////////////////////////
// Common data

// https://www2.census.gov/geo/docs/reference/codes/files/st41_or_cou.txt
var fipsCountyMap = {
    41001: "Baker County",
    41003: "Benton County",
    41005: "Clackamas County",
    41007: "Clatsop County",
    41009: "Columbia County",
    41011: "Coos County",
    41013: "Crook County",
    41015: "Curry County",
    41017: "Deschutes County",
    41019: "Douglas County",
    41021: "Gilliam County",
    41023: "Grant County",
    41025: "Harney County",
    41027: "Hood River County",
    41029: "Jackson County",
    41031: "Jefferson County",
    41033: "Josephine County",
    41035: "Klamath County",
    41037: "Lake County",
    41039: "Lane County",
    41041: "Lincoln County",
    41043: "Linn County",
    41045: "Malheur County",
    41047: "Marion County",
    41049: "Morrow County",
    41051: "Multnomah County",
    41053: "Polk County",
    41055: "Sherman County",
    41057: "Tillamook County",
    41059: "Umatilla County",
    41061: "Union County",
    41063: "Wallowa County",
    41065: "Wasco County",
    41067: "Washington County",
    41069: "Wheeler County",
    41071: "Yamhill County",
}


////////////////////////////////////////////////////////////////////////
// Incident: unscheduled
var incidentLayer = L.geoJSON(null, {
    pointToLayer: generateIncidentMarker,
});
$.getJSON("tripcheck.incident.esri.json", generateEsriJsonHandler({
    layer: incidentLayer,
    filterEsriFeature: function (feature) {
        return true;
        /*(feature.attributes.odotCategoryID == 'A') && 
                        (feature.attributes.odotSeverityID == 2 || 
                        feature.attributes.odotSeverityID == 3 || 
                        feature.attributes.odotSeverityID == 4 || 
                        feature.attributes.odotSeverityID == 5 || 
                        feature.attributes.odotSeverityID == 8);*/
    },
    onEachGeoJsonFeature: function (feature) {
        // The original coordinates is in spcacial reference wkid: 3857.
        // E.g. x: -13600885.141317938, y: 5709912.011602259
        // We use the display Lat/Long instead.
        feature.geometry.coordinates[0] = feature.properties.displayLongitude;
        feature.geometry.coordinates[1] = feature.properties.displayLatitude;
    },
    addToMapAfterLoading: true,
}));

////////////////////////////////////////////////////////////////////////
// Event: scheduled closure, slowdown, etc.
var eventLayer = L.geoJSON(null, {
    pointToLayer: generateEventMarker,
});

$.getJSON("tripcheck.event.esri.json", generateEsriJsonHandler({
    layer: eventLayer,
    filterEsriFeature: function (feature) { return true; },
    onEachGeoJsonFeature: function (feature) {
        // The original coordinates is in spcacial reference wkid: 3857.
        // E.g. x: -13600885.141317938, y: 5709912.011602259
        // We use the display Lat/Long instead.
        feature.geometry.coordinates[0] = feature.properties.displayLongitude;
        feature.geometry.coordinates[1] = feature.properties.displayLatitude;
    },
    addToMapAfterLoading: true,
})
);

////////////////////////////////////////////////////////////////////////
// Incident-TLE: Traffic Local Events. Events reported outside tripcheck agencies.
// https://tripcheck.com/scripts/map/data/incd-tle.js
var incidentTleLayer = L.geoJSON(null, {
    pointToLayer: generateIncidentTleMarker,
});

$.getJSON("tripcheck.incidentTle.esri.json", generateEsriJsonHandler({
    layer: incidentTleLayer,
    filterEsriFeature: function (feature) { return true; },
    onEachGeoJsonFeature: function (feature) {
        // Convert from Spacial Reference 3857 to 4326
        var latLng = L.CRS.EPSG3857.unproject(L.point(feature.geometry.coordinates));
        feature.geometry.coordinates[0] = latLng.lng;
        feature.geometry.coordinates[1] = latLng.lat;
    },
    addToMapAfterLoading: true,
})
);


///////////////////////////////////////
// Add them all
///////////////////////////////////////

var oregonCountyLayer = L.geoJSON(null, {
    style: {
        color: "#999", 
        weight: 1, 
        fillOpacity: 0.0,
        zIndex: 0,
    }
});

$.getJSON("oregon.county.geojson", function(data) {
    oregonCountyLayer.addData(data).addTo(map);
});

var overlayMaps = {
    "Incident": incidentLayer,
    "Event": eventLayer,
    "Incident TLE": incidentTleLayer,
    'Oregon': oregonCountyLayer,
}

L.control.layers(baseMaps, overlayMaps /*, { autoZIndex: false }*/).addTo(map);

///////////////////////////////////////
// Helper functions
///////////////////////////////////////

function generateIncidentMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#ee0000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).on('mouseover', function (e) {
        //open popup;
        var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(feature.properties.comments
            + '<br>odotSeverityID: ' + feature.properties.odotSeverityID
            + '<br>started: ' + feature.properties.startTime
            + '<br>updated: ' + feature.properties.lastUpdated)
            .openOn(map);
    });
}

function generateEventMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).on('mouseover', function (e) {
        //open popup;
        var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(feature.properties.comments
            + '<br>odotSeverityID: ' + feature.properties.odotSeverityID
            + '<br>started: ' + feature.properties.startTime
            + '<br>updated: ' + feature.properties.lastUpdated)
            .openOn(map);
    });
}


function generateIncidentTleMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#00ee00",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).on('mouseover', function (e) {
        //open popup;
        var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(feature.properties.publicCommentText
                + '<br>odotSeverityID: ' + feature.properties.travelImpact
                + '<br>started: ' + feature.properties.starts
                + '<br>updated: ' + feature.properties.lastUpdated)
            .openOn(map);
    });
}


// Generate a funciton that handles ESRI Json data
// Input: an option object that contains info to customize the returned function
function generateEsriJsonHandler(layerOptions) {
    /*
    layerOptions:
        layer: the overlay layer the EsriJson data will be loaded into
        filterEsriFeature: Filter out certain features. E.g. small delays
        onEachGeoJsonFeature: For each geojson feature, bind markers, popups, style, etc.
        addToMapAfterLoading: true means add this layer to map after processing
    */

    function onEsriJsonReceived(esriJson) {
        // Filter out certain features. E.g. small delays
        esriJson.features = esriJson.features.filter(layerOptions.filterEsriFeature);

        // Convert the ESRI Json format into GeoJson
        esri2geo.toGeoJSON(esriJson, function (err, geoJson) {

            // TODO: handle error

            // For each geojson feature, bind markers, popups, style, etc.
            geoJson.features.forEach(layerOptions.onEachGeoJsonFeature);

            // Show this overlay
            if (layerOptions.addToMapAfterLoading) layerOptions.layer.addData(geoJson).addTo(map);
        });
    }

    return onEsriJsonReceived;
};

