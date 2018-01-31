///////////////////////////////////////
// Helper functions
///////////////////////////////////////

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

    function onEsriJsonReceived(esriJson, textStatus, request) {
        // The resource is not modifed since the last update. Skip further processing
        if (request.status == 304) {
            return;
        }

        // Store ETag or Last Modified Time
        var eTag = request.getResponseHeader('ETag');
        var lastModified = request.getResponseHeader('Last-Modified');
        if (eTag) layerOptions.layer.eTag = eTag;
        if (lastModified) layerOptions.layer.lastModified = lastModified;

        // Filter out certain features. E.g. small delays
        esriJson.features = esriJson.features.filter(layerOptions.filterEsriFeature);

        // Convert the ESRI Json format into GeoJson
        esri2geo.toGeoJSON(esriJson, function (err, geoJson) {

            // TODO: handle error

            // For each geojson feature, bind markers, popups, style, etc.
            geoJson.features.forEach(layerOptions.onEachGeoJsonFeature);

            // Must get the value before we remove the layer to update data
            var hasLayer = map.hasLayer(layerOptions.layer);
            // Clear old markers
            if (layerOptions.layer) {
                layerOptions.layer.clearLayers();
                if (hasLayer)
                    map.removeLayer(layerOptions.layer);
                //delete layerOptions.layer;
            }
            // Show this overlay
            if (layerOptions.addToMapAfterLoading) {
                // We still want to update data even if we are not adding the layer to the map.
                layerOptions.layer.addData(geoJson);
                // On the initial load, check if we need to add this layer
                // On the following loads, check if the map already has this layer before the new data. It may be removed by user with the layer control.
                if (hasLayer || layerOptions.layer.isAddedInitially)
                    layerOptions.layer.addTo(map);
                if (layerOptions.layer.isAddedInitially)
                    layerOptions.layer.isAddedInitially = false;
            }
        });
    }

    return onEsriJsonReceived;
};

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

// initialize the map
var map = L.map('map', {
    center: [45.53, -122.68],
    zoom: 10,
    layers: [esriGray /*, esriGrayLabels*/]
});
map.addControl(new L.Control.Fullscreen());

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

var severityColorMap = {
    'info': 'darkblue',
    'minor': 'orange',
    'major': 'red'
}

var severityArray = ['info', // 0
    'minor',
    'major',
    'major',
    'major',
    'major', // 5
    'info',
    'info', // 7
    'major'];

////////////////////////////////////////////////////////////////////////
// Incident: unscheduled
// Create the layer first. Get the data later.
var incidentLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'car',
                prefix: 'fa',
                markerColor: severityColorMap[severityArray[feature.properties.odotSeverityID]],
                className: getMarkerClassName(severityArray[feature.properties.odotSeverityID])
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<strong>' + feature.properties.route + '</strong>'
                + '<br>' + feature.properties.comments
                + '<br>ID: ' + feature.properties.incidentId
                + '<br>Type: ' + feature.properties.odotCategoryDescript
                + '<br>odotSeverityID: ' + feature.properties.odotSeverityID
                + '<br>started: ' + feature.properties.startTime
                + '<br>updated: ' + feature.properties.lastUpdated)
                .openOn(map);
        });
    },
});


function getIncidentData() {
    $.ajax({
        url: "http://www.pa2.local/tripcheck/INCD.js",
        dataType: 'json',
        beforeSend: function (request) {
            if (incidentLayer.eTag) request.setRequestHeader('If-None-Match', incidentLayer.eTag);
            if (incidentLayer.lastModified) request.setRequestHeader('If-Modified-Since', incidentLayer.lastModified);
        },
        success: generateEsriJsonHandler({
            layer: incidentLayer,
            filterEsriFeature: function (feature) {
                return true;
                // return (feature.attributes.odotCategoryID == 'A') &&
                //     (feature.attributes.odotSeverityID == 2 ||
                //         feature.attributes.odotSeverityID == 3 ||
                //         feature.attributes.odotSeverityID == 4 ||
                //         //feature.attributes.odotSeverityID == 5 || 
                //         feature.attributes.odotSeverityID == 8);
            },
            onEachGeoJsonFeature: function (feature) {
                // The original coordinates is in spcacial reference wkid: 3857.
                // E.g. x: -13600885.141317938, y: 5709912.011602259
                // We use the display Lat/Long instead.
                feature.geometry.coordinates[0] = feature.properties.displayLongitude;
                feature.geometry.coordinates[1] = feature.properties.displayLatitude;
            },
            addToMapAfterLoading: true,
        }),
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}


////////////////////////////////////////////////////////////////////////
// Incident-TLE: Traffic Local Events. Events reported outside tripcheck agencies.
// https://tripcheck.com/scripts/map/data/incd-tle.js

var incidentTleSeverityMap = {
    'Substantial Daytime Delays': 'major',
    'Substantial Delays': 'major',
    'Substantial Nighttime Delays': 'minor',
    'Minimal Delays': 'info'
}

var incidentTleLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'car',
                prefix: 'fa',
                markerColor: severityColorMap[incidentTleSeverityMap[feature.properties.travelImpact]],
                className: getMarkerClassName(incidentTleSeverityMap[feature.properties.travelImpact])
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<strong>Location Start: ' + feature.properties.locationStart
                + '<br>Location End: ' + feature.properties.locationEnd
                + '</strong><br>' + feature.properties.publicCommentText
                + '<br>eventId: ' + feature.properties.eventId
                + '<br>Link: ' + feature.properties.infoUrl
                + '<br>odotSeverityID: ' + feature.properties.travelImpact
                + '<br>starts: ' + feature.properties.starts
                + '<br>ends: ' + feature.properties.ends
                + '<br>updated: ' + feature.properties.lastUpdated)
                .openOn(map);
        });
    }
    ,
});

function getIncidentTleData() {
    $.ajax({
        url: "http://www.pa2.local/tripcheck/INCD-tle.js",
        dataType: 'json',
        beforeSend: function (request) {
            if (incidentTleLayer.eTag) request.setRequestHeader('If-None-Match', incidentTleLayer.eTag);
            if (incidentTleLayer.lastModified) request.setRequestHeader('If-Modified-Since', incidentTleLayer.lastModified);
        },
        success: generateEsriJsonHandler({
            layer: incidentTleLayer,
            filterEsriFeature: function (feature) {
                return true;
                //return feature.attributes.travelImpact.toLowerCase().indexOf('substantial') === 0;
            },
            onEachGeoJsonFeature: function (feature) {
                // Convert from Spacial Reference 3857 to 4326
                var latLng = L.CRS.EPSG3857.unproject(L.point(feature.geometry.coordinates));
                feature.geometry.coordinates[0] = latLng.lng;
                feature.geometry.coordinates[1] = latLng.lat;
            },
            addToMapAfterLoading: true,
        }),
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}

////////////////////////////////////////////////////////////////////////
// Event: scheduled closure, slowdown, etc.
var eventLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'flag',
                prefix: 'fa',
                markerColor: severityColorMap[severityArray[feature.properties.odotSeverityID]],
                className: getMarkerClassName(severityArray[feature.properties.odotSeverityID])
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<strong>' + feature.properties.route
                + '</strong><br>Id: ' + feature.properties.incidentId
                + '<br>Type: ' + feature.properties.odotCategoryDescript
                + '<br>' + feature.properties.comments
                + '<br>odotSeverityID: ' + feature.properties.odotSeverityID
                + '<br>started: ' + feature.properties.startTime
                + '<br>updated: ' + feature.properties.lastUpdated)
                .openOn(map);
        });
    },
});
function getEventData() {
    $.ajax({
        url: "http://www.pa2.local/tripcheck/EVENT.js",
        dataType: 'json',
        beforeSend: function (request) {
            if (eventLayer.eTag) request.setRequestHeader('If-None-Match', eventLayer.eTag);
            if (eventLayer.lastModified) request.setRequestHeader('If-Modified-Since', eventLayer.lastModified);
        },
        success: generateEsriJsonHandler({
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
        }),
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}

////////////////////////////////////////////////////////////////////////
// Vancouver accident JSON
// Original: http://www.wsdot.com/traffic/webservices/incidents.asmx/IncidentsJson?MapAreaID=L3VTR&Count=-1
// Proxy: http://www.pa2.local/wsdot/IncidentsJson?MapAreaID=L3VTR&Count=-1

var wsdotLayer = L.featureGroup();

var wsdotSeverity = {
    'Highest': 'major',
    'High': 'major',
    'Medium': 'minor',
    'Low': 'info',
}
function getWsdotData() {
    $.ajax({
        url: "http://www.pa2.local/wsdot/MapArea=L3VTR",
        dataType: 'json',
        beforeSend: function (request) {
            if (wsdotLayer.eTag) request.setRequestHeader('If-None-Match', wsdotLayer.eTag);
            if (wsdotLayer.lastModified) request.setRequestHeader('If-Modified-Since', wsdotLayer.lastModified);
        },
        success: function (jsonData, textStatus, request) {
            if (request.status == 304) {
                return;
            }

            // Compare the HTTP response body to see if we need to update the map. There is no ETag or Last Modified
            if (wsdotLayer.jsonData && wsdotLayer.jsonData === jsonData)
                return;
            else
                wsdotLayer.jsonData = jsonData;

            // Store ETag or Last Modified Time
            var eTag = request.getResponseHeader('ETag');
            var lastModified = request.getResponseHeader('Last-Modified');
            if (eTag) wsdotLayer.eTag = eTag;
            if (lastModified) wsdotLayer.lastModified = lastModified;

            var hasLayer = map.hasLayer(wsdotLayer);
            wsdotLayer.clearLayers();
            if (hasLayer) map.removeLayer(wsdotLayer);

            jsonData.forEach(function (item) {
                wsdotLayer.addLayer(L.marker(
                    [item.StartRoadwayLocation.Latitude, item.StartRoadwayLocation.Longitude],
                    {
                        icon: L.AwesomeMarkers.icon({
                            icon: 'car',
                            prefix: 'fa',
                            markerColor: severityColorMap[wsdotSeverity[item.Priority]],
                            className: getMarkerClassName(wsdotSeverity[item.Priority])
                        })
                    }).on('mouseover', function (e) {
                        //open popup;
                        var popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent('<strong>' + item.StartRoadwayLocation.RoadName + ' Mile Post ' + item.StartRoadwayLocation.MilePost
                            + '</strong><br>' + item.HeadlineDescription
                            + '<br>Id: ' + item.AlertID
                            + '<br>Type: ' + item.EventCategory
                            + '<br>Priority: ' + item.Priority
                            + ((item.StartTime) ? '<br>StartTime: ' + new Date(parseInt(item.StartTime.substr(6))).toLocaleString() : '')
                            + ((item.EndTime) ? '<br>EndTime: ' + new Date(parseInt(item.EndTime.substr(6))).toLocaleString() : '')
                            + ((item.LastUpdatedTime) ? '<br>updated: ' + new Date(parseInt(item.LastUpdatedTime.substr(6))).toLocaleString() : ''))
                            .openOn(map);
                    })
                );
            });
            if (hasLayer || wsdotLayer.isAddedInitially)
                wsdotLayer.addTo(map);
            if (wsdotLayer.isAddedInitially)
                wsdotLayer.isAddedInitially = false;
        },
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}


////////////////////////////////////////////////////////////////////////
// PGE outages

/*
<div class="global_subhead" style="margin-bottom:5px; width:300px;">
Outage Details for 97035
</div>
<table class="global_table_data_highlighted">
<tbody>
<tr>
    <td class="colorGray1" style="width:150px;">Number of Outages</td>
    <td>1</td></tr>
<tr style="height:5px;"><td></td><td></td></tr>
<tr>
    <td class="colorGray1" style="width:150px;">Cause</td>
    <td>Investigating</td></tr>
<tr style="height:5px;"><td></td><td></td></tr>
<tr>
    <td class="colorGray1" style="width:150px;">Customers Affected</td>
    <td>17</td></tr>
<tr>
    <td class="colorGray1" style="width:150px;">Calls Received</td>
    <td>17</td></tr>
<tr style="height:5px;"><td></td><td></td></tr>
<tr>
    <td class="colorGray1" style="width:150px;">Est. Time On</td>
    <td>January 25, 2018 8:47 p.m.</td>
</tr>
</tbody></table>
*/

function getPgeSeverity(feature) {
    var descriptionArray = $.parseHTML(feature.properties.description);
    if (descriptionArray.length < 2) return 'major';
    var tdArray = descriptionArray[1].querySelectorAll('td');
    for (var i = 0; i < tdArray.length; i++) {
        if (tdArray[i].textContent === 'Customers Affected') {
            if (+tdArray[i + 1].textContent >= 1000) return 'major';
            if (+tdArray[i + 1].textContent >= 100) return 'minor';
            return 'info';
        }
    }
}

var pgeLayer = L.geoJson(null, {
    filter: function () {
        return true;
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'plug',
                prefix: 'fa',
                markerColor: severityColorMap[getPgeSeverity(feature)],
                className: getMarkerClassName(getPgeSeverity(feature)),
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<strong>PGE Outage</strong><br>' + feature.properties.description)
                .openOn(map);
        });
    }
}
);

// Original: https://www.portlandgeneral.com/outage-data/outages
function getPgeData() {

    $.ajax({
        url: "http://www.pa2.local/pge/outages",
        dataType: 'text', // returns raw text that will be pared by Omnivore
        success: function (kmlData, textStatus, request) {
            if (request.status == 304) {
                return;
            }

            // Compare the HTTP response body to see if we need to update the map. There is no ETag or Last Modified
            if (pgeLayer.kmlData && pgeLayer.kmlData === kmlData)
                return;
            else
                pgeLayer.kmlData = kmlData;

            var hasLayer = map.hasLayer(pgeLayer);
            pgeLayer.clearLayers();
            if (hasLayer) map.removeLayer(pgeLayer);
            var pgeKmlLayer = omnivore.kml.parse(kmlData, null, pgeLayer);

            if (hasLayer || pgeLayer.isAddedInitially) pgeLayer.addTo(map);
            if (pgeLayer.isAddedInitially) pgeLayer.isAddedInitially = false;
        }
    });
}

////////////////////////////////////////////////////////////////////////
// Pacific Power outage data 
// https://www.pacificpower.net/etc/datafiles/outagemap/outagesOR.json

var pacificPowerLayer = L.featureGroup();

function getPacificPowerSeverity(item) {
    if (item.custOut >= 1000) return 'major';
    if (item.custOut >= 100) return 'minor';
    return 'info';
}

function getPacificPowerData() {

    $.ajax({
        url: "http://www.pa2.local/pacific-power/outagesOR.json",
        dataType: 'json',
        beforeSend: function (request) {
            if (pacificPowerLayer.eTag) request.setRequestHeader('If-None-Match', pacificPowerLayer.eTag);
            if (pacificPowerLayer.lastModified) request.setRequestHeader('If-Modified-Since', pacificPowerLayer.lastModified);
        },
        success: function (jsonData, textStatus, request) {
            if (request.status == 304) {
                return;
            }

            // Store ETag or Last Modified Time
            var eTag = request.getResponseHeader('ETag');
            var lastModified = request.getResponseHeader('Last-Modified');
            if (eTag) pacificPowerLayer.eTag = eTag;
            if (lastModified) pacificPowerLayer.lastModified = lastModified;

            var hasLayer = map.hasLayer(pacificPowerLayer);
            pacificPowerLayer.clearLayers();
            if (hasLayer) map.removeLayer(pacificPowerLayer);

            jsonData.outages.forEach(function (item) {
                pacificPowerLayer.addLayer(L.marker(
                    [item.latitude, item.longitude],
                    {
                        icon: L.AwesomeMarkers.icon({
                            icon: 'plug',
                            prefix: 'fa',
                            markerColor: severityColorMap[getPacificPowerSeverity(item)],
                            className: getMarkerClassName(getPacificPowerSeverity(item)),
                        })
                    }).on('mouseover', function (e) {
                        //open popup;
                        var popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent('<strong>Pacific Power Outage</strong>'
                            + '<br>Outage Count: ' + item.outCount
                            + '<br>Customers Count: ' + item.custOut
                            + '<br>Last Updated: ' + jsonData.last_upd)
                            .openOn(map);
                    })
                );
            });

            if (hasLayer || pacificPowerLayer.isAddedInitially) pacificPowerLayer.addTo(map);
            if (pacificPowerLayer.isAddedInitially) pacificPowerLayer.isAddedInitially = false;
        },
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}
// TODO: add weather.gov alerts for Portland Metro
// https://api.weather.gov/alerts?active=1&zone=ORZ006,WAZ039

// TODO: get flash alert emergency XML
// http://www.craigwalker.net/IIN/reportsX/flashnews_xml_emergency.php

/*
Schema: http://www.flashalert.net/file-types/

<flashnews updated=”2012-08-14 03:12:18″>
    <emergency>
        <emergency_category name=”Central Co. Schools”>
            <emergency_report report_id=”26940″ effective_date=”2012-08-14 15:08:40″ updated=”0″ last_update=”2012-08-14 15:08:50″ testing=”0″ schoolrelated=”1″ orgid=”413″ custom=”0″ operating_code=”5″ transpo_code=”20″>
                <detail>
                    <![CDATA[2 hrs late, Buses on snow rts]]>
                </detail>
                <tomorrow>
                    <![CDATA[Effective tomorrow – Wed Aug 15th]]>
                </tomorrow>
                <orgname orgid=”413″ tier=”1″ zipcode=”x”>
                    <![CDATA[Cityville Schools]]>
                </orgname>
            </emergency_report>
        </emergency_category>
    </emergency>
</flashnews>
*/


////////////////////////////////////////////////////////////////////////
// weather.gov hydro alerts for Portland Metro
// http://water.weather.gov/ahps2/rss/alert/or.rss
// Gauge locations
// https://water.weather.gov/ahps2/index.php?wfo=PQR

var floodSeverityMap = {
    'Near flood stage': 'info',
    'Minor flooding': 'minor',
    'Moderate flooding': 'major',
    'Major flooding': 'major',
}

var waterGaugeLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.AwesomeMarkers.icon({
                icon: 'tint',
                prefix: 'fa',
                markerColor: severityColorMap[floodSeverityMap[feature.properties.level]],
                className: getMarkerClassName(floodSeverityMap[feature.properties.level]),
            })
        }).on('mouseover', function (e) {
            //open popup;
            var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<strong>' + feature.properties.name
                + '</strong><br>' + feature.properties.level
                + '<br>' + feature.properties.link
                + '<br>' + (new Date(feature.properties.pubDate).toLocaleString()))
                .openOn(map);
        });
    }
});

//var waterGaugesGeoJson; defined in water-lookup.js
function getWaterGaugeData() {
    $.ajax({
        url: "http://www.pa2.local/water-alert/or.rss",
        dataType: 'xml',
        beforeSend: function (request) {
            if (waterGaugeLayer.eTag) request.setRequestHeader('If-None-Match', waterGaugeLayer.eTag);
            if (waterGaugeLayer.lastModified) request.setRequestHeader('If-Modified-Since', waterGaugeLayer.lastModified);
        },
        success: function (rssData, textStatus, request) {
            if (request.status == 304) {
                return;
            }

            // Store ETag or Last Modified Time
            var eTag = request.getResponseHeader('ETag');
            var lastModified = request.getResponseHeader('Last-Modified');
            if (eTag) waterGaugeLayer.eTag = eTag;
            if (lastModified) waterGaugeLayer.lastModified = lastModified;

            var $xml = $(rssData);
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
                    if (titleParts[0].indexOf('Action') === 0) item.level = 'Near flood stage';
                    else if (titleParts[0].indexOf('Minor') === 0) item.level = 'Minor flooding';
                    else if (titleParts[0].indexOf('Moderate') === 0) item.level = 'Moderate flooding';
                    else if (titleParts[0].indexOf('Major') === 0) item.level = 'Major flooding';

                    item.lid = titleParts[2].trim().toLowerCase();

                    alertArray.push(item);
                }
            });

            // Check which gauge is generating the alert
            var alertedWaterGaugesGeoJson = { "type": "FeatureCollection" };
            alertedWaterGaugesGeoJson.features = waterGaugesGeoJson.features.filter(function (waterGauge) {
                for (var i = 0; i < alertArray.length; i++) {
                    if (waterGauge.properties.lid === alertArray[i].lid) {
                        waterGauge.properties.level = alertArray[i].level;
                        waterGauge.properties.link = alertArray[i].link;
                        waterGauge.properties.pubDate = alertArray[i].pubDate;
                        return true;
                    }
                }
                return false;
            });

            var hasLayer = map.hasLayer(waterGaugeLayer);
            waterGaugeLayer.clearLayers();
            if (hasLayer) map.removeLayer(waterGaugeLayer);

            waterGaugeLayer.addData(alertedWaterGaugesGeoJson);

            if (hasLayer || waterGaugeLayer.isAddedInitially) waterGaugeLayer.addTo(map);
            if (waterGaugeLayer.isAddedInitially) waterGaugeLayer.isAddedInitially = false;
        },
        error: function (request, textStatus, error) {
            console.error(error);
        }
    });
}


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

$.getJSON("oregon.county.geojson", function (data) {
    oregonCountyLayer.addData(data);//.addTo(map);
});

var overlayMaps = {
    "Incident": incidentLayer,
    "Event": eventLayer,
    "Incident TLE": incidentTleLayer,
    'Vancouver': wsdotLayer,
    'PGE': pgeLayer,
    'Pacific Power': pacificPowerLayer,
    'Flood': waterGaugeLayer,
    'Oregon': oregonCountyLayer,
    'beecn': L.esri.featureLayer({
        url: "https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/92",
    }),
}

var layerControl = L.control.layers(baseMaps, overlayMaps /*, { autoZIndex: false }*/).addTo(map);

// Each layer and the function that update it
var updateFunctionArray = [
    getIncidentData,
    getEventData,
    getIncidentTleData,
    getWsdotData,
    getPgeData,
    getPacificPowerData,
    getWaterGaugeData
]

// Update all layers
function updateLayers() {
    updateFunctionArray.forEach(function (updateFunction) { // parameters from the map above: value, key
        updateFunction();
    })
}

// Initially add all layers. TODO: save this in local storage or cookie
incidentLayer.isAddedInitially = true;
eventLayer.isAddedInitially = true;
incidentTleLayer.isAddedInitially = true;
wsdotLayer.isAddedInitially = true;
pgeLayer.isAddedInitially = true;
pacificPowerLayer.isAddedInitially = true;
waterGaugeLayer.isAddedInitially = true;

updateLayers();

// Update layers every 5 minutes
var updateInterval = setInterval(updateLayers, 5 * 60 * 1000);

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<i style="background: ' + severityColorMap['major']
        + '"></i><input class="severity-control" checked id="major" type="checkbox">Major';
    div.innerHTML += '<br><input class="severity-control" checked id="minor" type="checkbox"><i style="background: '
        + severityColorMap['minor'] + '"></i>Minor';
    div.innerHTML += '<br><input class="severity-control" checked id="info" type="checkbox"><i style="background: '
        + severityColorMap['info'] + '"></i>Info';
    return div;
};

legend.addTo(map);


// Without 'awesome-marker ', this className will override the style for the background icon. What a hack!
function getMarkerClassName(severityLevel) {
    //console.log($('#' + severityLevel).is(':checked'));
    if ($('#' + severityLevel).is(':checked')) {
        return 'awesome-marker ' + severityLevel + ' ';
    }
    else {
        return 'awesome-marker hideMarker ' + severityLevel + ' ';
    }
}

$(function () {
    //$('.severity-control').prop('checked', true);
    $('.severity-control').on('change', function () {
        if ($(this).is(':checked'))
            $('.' + $(this).attr('id')).removeClass('hideMarker');
        else
            $('.' + $(this).attr('id')).addClass('hideMarker');
    })
})