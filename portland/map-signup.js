///////////////////////////////////////
// Helper functions
///////////////////////////////////////

var signupLinks = {
    'multnomah': 'https://member.everbridge.net/index/453003085612905#/login',
    'clackamas': 'http://www.clackamas.us/emergency/ccens.html',
    'lake oswego': 'https://www.ci.oswego.or.us/citymanager/code-red-emergency-notification',
    'milwaukie': 'http://www.milwaukieoregon.gov/police/sign-codered-emergency-telephone-notification-system',
    'columbia': 'http://ww2.citywatchonline.com/Public/Signup.aspx?SUID=fat2WMgptRBn1uknCPcs+Q==',
    'washington': 'http://www.wccca.com/wcens/',
    'tigard': 'https://public.coderedweb.com/CNE/1E28B1D668D7',
    'linn': 'https://member.everbridge.net/index/453003085613276#/login',
    'benton': 'https://member.everbridge.net/index/453003085613276#/login',
    'marion': 'https://member.everbridge.net/index/892807736721950#/login',
    'clark': 'https://member.everbridge.net/index/453003085616336',
    'cowlitz': 'http://www.co.cowlitz.wa.us/index.aspx?NID=702',
    'skamania': 'https://signup.hyper-reach.com/hyper_reach/sign_up_page_2/?id=45462',
    'wahkiakum': 'http://www.co.wahkiakum.wa.us/depts/sheriff/EmergencyComunityNotification.htm',
}

function buildSignupLinkHtml(cityOrCountyName) {
    if (cityOrCountyName == '') return '';
    if (cityOrCountyName.toLowerCase() in signupLinks) {
        return '<a href="' + signupLinks[cityOrCountyName.toLowerCase()] + '">' + cityOrCountyName + '</a>'
    }
    return cityOrCountyName;
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


// Metro County boundary
var countyBoundaryLayer = L.esri.featureLayer({
    url: 'https://gis.oregonmetro.gov/arcgis/rest/services/OpenData/BoundaryData/MapServer/1',
    style: function (feature, layer) {
        return {
            color: '#0d0d0d',
            weight: 2,
            fillOpacity: 0,
        }
    },
})//.addTo(map)

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

        $('#city-name').html(buildSignupLinkHtml(queryResult.jurisCity))
        $('#county-name').html(buildSignupLinkHtml(queryResult.county))
    },
    'status,lng,lat,fullAddress,jurisCity,county,zipcode'
);

//////////////////////////////////////////////////
// Overlay layers
//////////////////////////////////////////////////

var countiesLayer = L.geoJSON(null, {
    style: {
        color: "#999",
        weight: 1,
        fillOpacity: 0.0,
        zIndex: 0,
    },
    onEachFeature: function (feature, layer) {
        // events
        layer.on({
            mouseover: function () {
                this.setStyle({
                    'fillColor': '#b45501',
                    fillOpacity: 0.5,
                });
            },
            mouseout: function () {
                this.setStyle({
                    'fillColor': '#f0d1b1',
                    fillOpacity: 0,
                });
            },
            click: function (ev) {

                // The county layer doesn't have city info. Clear the city name
                //$('#city-name').text('')
                //$('#county-name').html(buildSignupLinkHtml(feature.properties.name))

                if (['washington', 'multnomah', 'clackamas'].indexOf(feature.properties.name.toLowerCase()) >= 0) {

                    var latlng = map.mouseEventToLatLng(ev.originalEvent);
                    console.log(latlng.lat + ', ' + latlng.lng);

                    /* There is a 500 server error when calling on a location south of Washington County.
                    Use $.getJSON in order to be able to handle the 500 error.
                    RLIS.QueryPoint({ x: latlng.lng, y: latlng.lat },
                        function (result, error) {});
                    */

                    $.getJSON('https://gis.oregonmetro.gov/rlisapi2/QueryPoint/?lng=' + latlng.lng + '&lat=' + latlng.lat + '&fields=status,lng,lat,fullAddress,jurisCity,county,zipcode&token=G2DScjgJRcas5MBT9cf7lY4IxxFY_kURboqrAiXbeTY.', function (result) {
                        // result = {error: false, data: [{status: 'success', county: 'Washington', ...} ]}
                        // When the locatin is outside Metro boundary, returns undefined.
                        if (!result || result.error || !result.data || result.data.length == 0) {
                            console.error('No result found');
                            $('#city-name').text('');
                            $('#county-name').text('');
                            return;
                        }

                        var queryResult = result.data[0];

                        if (queryResult.status == 'failure') {
                            console.error(JSON.stringify(result, null, ' '));
                            $('#city-name').text('');
                            $('#county-name').text('');
                            return;
                        }

                        $('#city-name').html(buildSignupLinkHtml(queryResult.jurisCity))
                        $('#county-name').html(buildSignupLinkHtml(queryResult.county))

                        if (marker) marker.removeFrom(map);
                        map.panTo(latlng)//, 12);
                        marker = L.marker(latlng).addTo(map);
                    }).fail(function (error) {
                        $('#city-name').text('');
                        $('#county-name').text('');
                        console.error(error)
                    });
                }
                else {
                    $('#city-name').text('');
                    $('#county-name').html(buildSignupLinkHtml(feature.properties.name))
                }

                // Prevent the map from getting the click event
                L.DomEvent.stop(ev);
            }
        });
        layer.bindTooltip(feature.properties.name, {
            permanent: true,
            direction: 'center',
            offset: L.point(0, -8), // To display Multnomah properly
            className: 'countyLabel'
        });
    }
});

$.getJSON("counties.geojson", function (data) {
    countiesLayer.addData(data);//.addTo(map);
});

var overlayMaps = {
    'Metro County': countyBoundaryLayer,
    'Oregon': countiesLayer,
    'beecn': L.esri.featureLayer({
        url: "https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/92",
    }),
}


// initialize the map
var map = L.map('map-signup', {
    center: [45.388, -122.519],
    zoom: 8,
    layers: [esriGray, countiesLayer /*, esriGrayLabels*/]
}).on('click', function (ev) {
    $('#city-name').text('');
    $('#county-name').text('Outside managed area');
});

var layerControl = L.control.layers(baseMaps, overlayMaps /*, { autoZIndex: false }*/).addTo(map);


$(function () {
    //$('.severity-control').prop('checked', true);
})

