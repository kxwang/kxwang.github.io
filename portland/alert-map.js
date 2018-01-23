//////////////////////////////////////////////////
// Base layers
//////////////////////////////////////////////////

// The feature layer from Metro
var esri = L.esri.featureLayer({
    url: "https://gis.oregonmetro.gov/arcgis/rest/services/OpenData/BoundaryData/MapServer/1",
});

// Base layer from Metro. Token required
var esriBase = L.esri.tiledMapLayer({
    url: "https://gis.oregonmetro.gov/arcgis/rest/services/metromap/baseGraySimple/MapServer",
    token: 'FKzRbI4X2PFi6h4cg3yLlWv_OPz0BJWGtKEWxFwhufk.',
});


// BEECN
// https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/92
var beecn = L.esri.featureLayer({
    url: "https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/92",
});

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
    "Streets": streetsLayer,
    'esriBase': esriBase
};

// initialize the map
var map = L.map('map', {
    center: [45.53, -122.68],
    zoom: 10,
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

////////////////////////////////////////////////////////////////////////
// Incident: unscheduled
// Create the layer first. Get the data later.
var incidentLayer = L.geoJSON(null, {
    pointToLayer: generateIncidentMarker,
});
$.getJSON("http://www.pccep.local/tripcheck/INCD.js", generateEsriJsonHandler({
    layer: incidentLayer,
    filterEsriFeature: function (feature) {
        //return true;
        return (feature.attributes.odotCategoryID == 'A') &&
            (feature.attributes.odotSeverityID == 2 ||
                feature.attributes.odotSeverityID == 3 ||
                feature.attributes.odotSeverityID == 4 ||
                //feature.attributes.odotSeverityID == 5 || 
                feature.attributes.odotSeverityID == 8);
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

$.getJSON("http://www.pccep.local/tripcheck/EVENT.js", generateEsriJsonHandler({
    layer: eventLayer,
    filterEsriFeature: function (feature) {
        // return true;
        return (feature.attributes.odotSeverityID == 2 ||
            feature.attributes.odotSeverityID == 3 ||
            feature.attributes.odotSeverityID == 4 ||
            //feature.attributes.odotSeverityID == 5 || 
            feature.attributes.odotSeverityID == 8);
    },
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


// Vancouver accident JSON
// Original
// http://www.wsdot.com/traffic/webservices/incidents.asmx/IncidentsJson?MapAreaID=L3VTR&Count=-1
// Proxy
// http://www.pccep.local/wsdot/IncidentsJson?MapAreaID=L3VTR&Count=-1

var wsdotLayer = L.featureGroup().addTo(map);

$.getJSON("http://www.pccep.local/wsdot/MapArea=L3VTR")
    .done(function (jsonData) {
        jsonData.forEach(function (item) {
            wsdotLayer.addLayer(L.marker(
                [item.StartRoadwayLocation.Latitude, item.StartRoadwayLocation.Longitude],
                {
                    icon: redCarMarker
                }).on('mouseover', function (e) {
                    //open popup;
                    var popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent(item.HeadlineDescription
                        + '<br>Priority: ' + item.Priority
                        + ((item.StartTime) ? '<br>StartTime: ' + new Date(parseInt(item.StartTime.substr(6))).toLocaleString() : '')
                        + ((item.EndTime) ? '<br>EndTime: ' + new Date(parseInt(item.EndTime.substr(6))).toLocaleString() : '')
                        + ((item.LastUpdatedTime) ? '<br>updated: ' + new Date(parseInt(item.LastUpdatedTime.substr(6))).toLocaleString() : ''))
                        .openOn(map);
                })
            );
        });
    })
    .fail(function (jqxhr, textStatus, error) {
        console.error(error);
    });



// PGE outages

var pgeLayer = L.geoJson(null, {
    filter: function () {
        return true;
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'plug',
                prefix: 'fa',
                markerColor: 'red'
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('PGE Outage <br>' + feature.properties.description)
                .openOn(map);
        });
    }
}
).addTo(map);

// https://www.portlandgeneral.com/outage-data/outages
var pgeKmlLayer = omnivore.kml('http://www.pccep.local/pge/outages', null, pgeLayer);


// Pacific Power outage data 
// https://www.pacificpower.net/etc/datafiles/outagemap/outagesOR.json

var pacificPowerLayer = L.featureGroup().addTo(map);

$.getJSON("http://www.pccep.local/pacific-power/outagesOR.json")
    .done(function (jsonData) {
        jsonData.outages.forEach(function (item) {
            pacificPowerLayer.addLayer(L.marker(
                [item.latitude, item.longitude],
                {
                    icon: L.AwesomeMarkers.icon({
                        icon: 'plug',
                        prefix: 'fa',
                        markerColor: 'orange'
                    })
                }).on('mouseover', function (e) {
                    //open popup;
                    var popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent('Pacific Power Outage'
                        + '<br>Outage Count: ' + item.outCount
                        + '<br>Customers Count: ' + item.custOut
                        + '<br>Last Updated: ' + jsonData.last_upd)
                        .openOn(map);
                })
            );
        });
    })
    .fail(function (jqxhr, textStatus, error) {
        console.error(error);
    });

// TODO: add weather.gov alerts for Portland Metro
// https://api.weather.gov/alerts?active=1&zone=ORZ006,WAZ039


// TODO: add weather.gov alerts for Portland Metro
// http://water.weather.gov/ahps2/rss/alert/ca.rss
// http://water.weather.gov/ahps/rss/alerts.php
// Gauge locations
// https://water.weather.gov/ahps2/index.php?wfo=PQR


var floodColorMap = {
    'Near flood stage': 'darkblue',
    'Minor flooding': 'orange',
    'Moderate flooding': 'pink',
    'Major flooding': 'red',
}

var waterGaugeLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'tint',
                prefix: 'fa',
                markerColor: floodColorMap[feature.properties.level]
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(feature.properties.name
                + '<br>' + feature.properties.level
                + '<br>' + feature.properties.link
                + '<br>' + feature.properties.pubDate)
                .openOn(map);
        });
    }
});

//var waterGaugesGeoJson; defined in water-lookup.js
$.get('http://www.pccep.local/water-alert/or.rss', function (data) {
    var $xml = $(data);
    var alertArray = [];
    $xml.find("item").each(function () {
        var $this = $(this),
            item = {
                title: $this.find("title").text(),
                link: $this.find("link").text(),
                pubDate: $this.find("pubDate").text()
            }

        // Format of title:
        // Action (16.35 ft) - Alert - DLLO3 - Tualatin River near Dilley (Oregon)
        var titleParts = item.title.split('-');
        if (titleParts.length === 4) {
            if(titleParts[0].indexOf('Action') === 0) item.level = 'Near flood stage';
            else if(titleParts[0].indexOf('Minor') === 0) item.level = 'Minor flooding';
            else if(titleParts[0].indexOf('Moderate')  === 0) item.level = 'Moderate flooding';
            else if(titleParts[0].indexOf('Major') === 0) item.level = 'Major flooding';

            item.lid = titleParts[2].trim().toLowerCase();

            alertArray.push(item);
        }
    });

    var alertedWaterGaugesGeoJson = {"type":"FeatureCollection"};
    alertedWaterGaugesGeoJson.features = waterGaugesGeoJson.features.filter(function(waterGauge){
        for(var i=0; i<alertArray.length; i++) {
            if(waterGauge.properties.lid === alertArray[i].lid) {
                waterGauge.properties.level = alertArray[i].level;
                waterGauge.properties.link = alertArray[i].link;
                waterGauge.properties.pubDate = alertArray[i].pubDate;
                return true;
            }
        }
        return false;
    });

    waterGaugeLayer.addData(alertedWaterGaugesGeoJson).addTo(map)
})


////////////////////////////////////////////////////////////////////////
// Incident-TLE: Traffic Local Events. Events reported outside tripcheck agencies.
// https://tripcheck.com/scripts/map/data/incd-tle.js
var incidentTleLayer = L.geoJSON(null, {
    pointToLayer: generateIncidentTleMarker,
});

$.getJSON("http://www.pccep.local/tripcheck/INCD-tle.js", generateEsriJsonHandler({
    layer: incidentTleLayer,
    filterEsriFeature: function (feature) {
        // return true; 
        return feature.attributes.travelImpact.toLowerCase().indexOf('substantial') === 0;
    },
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

// $.getJSON("oregon.county.geojson", function(data) {
//     oregonCountyLayer.addData(data).addTo(map);
// });

var overlayMaps = {
    "Incident": incidentLayer,
    "Event": eventLayer,
    "Incident TLE": incidentTleLayer,
    'Vancouver': wsdotLayer,
    'PGE': pgeLayer,
    'Pacific Power': pacificPowerLayer,
    //'Oregon': oregonCountyLayer,

    'esri': esri,
    'beecn': beecn,
}

L.control.layers(baseMaps, overlayMaps /*, { autoZIndex: false }*/).addTo(map);

///////////////////////////////////////
// Helper functions
///////////////////////////////////////
// Creates a red marker with the coffee icon
var redCarMarker = L.AwesomeMarkers.icon({
    icon: 'car',
    prefix: 'fa',
    markerColor: 'red'
});

var orangeCarMarker = L.AwesomeMarkers.icon({
    icon: 'car',
    prefix: 'fa',
    markerColor: 'orange'
});

var yellowFlagMarker = L.AwesomeMarkers.icon({
    icon: 'flag',
    prefix: 'fa',
    markerColor: 'purple'
});

function generateIncidentMarker(feature, latlng) {
    return L.marker(latlng, {
        icon: redCarMarker
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

    // return L.circleMarker(latlng, {
    //     radius: 8,
    //     fillColor: "#ee0000",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // }).on('mouseover', function (e) {
    //     //open popup;
    //     var popup = L.popup()
    //         .setLatLng(e.latlng)
    //         .setContent(feature.properties.comments
    //         + '<br>odotSeverityID: ' + feature.properties.odotSeverityID
    //         + '<br>started: ' + feature.properties.startTime
    //         + '<br>updated: ' + feature.properties.lastUpdated)
    //         .openOn(map);
    // });
}

function generateEventMarker(feature, latlng) {
    return L.marker(latlng, {
        icon: yellowFlagMarker
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
    return L.marker(latlng, {
        icon: orangeCarMarker
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

