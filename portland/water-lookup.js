
//////////////////////////////////////////////////
// Use PortlandMaps.com to get a list of address candidates. Show them in the auto-complete list
//////////////////////////////////////////////////

$("#user-address").autocomplete({
    delay: 200,
    source: function (request, response) {
        $.ajax({
            url: "https://www.portlandmaps.com/arcgis/rest/services/Public/Centerline_Geocoding_PDX/GeocodeServer/findAddressCandidates",
            dataType: "jsonp",
            data: { Street: "", City: "", Zip: "", 'Single Line Input': request.term, outFields: "", outSR: "4326", searchExtent: "", f: "json" },
            success: function (data) {
                if (data.candidates.length === 0) { response(''); return; }

                var candidates = data.candidates.map(function (candidate, index) {
                    return {
                        id: index,
                        label: candidate.address,
                        value: candidate.address,
                        location: candidate.location
                    };
                });
                //console.log(candidates);
                response(candidates);
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        console.log("Value: " + ui.item.value + ", ID: " + ui.item.id);
        if (marker) marker.removeFrom(map);
        map.flyTo(new L.LatLng(ui.item.location.y, ui.item.location.x), 15);
        marker = L.marker([ui.item.location.y, ui.item.location.x]).addTo(map);

        getWaterDistrictName(ui.item.location);
    }
});


//////////////////////////////////////////////////
// Use location to look up water district
//////////////////////////////////////////////////

function getWaterDistrictName(location) {
    //console.log(JSON.stringify(location));
    var geometryObject = {
        x: location.x,
        y: location.y,
        spatialReference: {
            wkid: 4326
        }
    }

    var waterDistrictQueryObject = {
        where: '',
        text: '',
        objectIds: '',
        time: '',
        geometry: JSON.stringify(geometryObject),
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        relationParam: '',
        outFields: 'DISTRICT',
        returnGeometry: 'false',
        returnTrueCurves: 'false',
        maxAllowableOffset: '',
        geometryPrecision: '',
        outSR: '',
        returnIdsOnly: 'false',
        returnCountOnly: 'false',
        orderByFields: '',
        groupByFieldsForStatistics: '',
        outStatistics: '',
        returnZ: 'false',
        returnM: 'false',
        gdbVersion: '',
        returnDistinctValues: 'false',
        resultOffset: '',
        resultRecordCount: '',
        f: 'pjson'
    }

    var waterLookupUrl = 'https://www.portlandmaps.com/arcgis/rest/services/Public/Utilities_Water/MapServer/6/query';
    $.ajax({
        url: waterLookupUrl,
        data: waterDistrictQueryObject,
        dataType: 'jsonp',
        success: function (result) {
            try {
                /*
                {
                 "displayFieldName": "PhoneNo",
                 "fieldAliases": {
                    "DISTRICT": "DISTRICT"
                 },
                 "fields": [
                    {
                     "name": "DISTRICT",
                     "type": "esriFieldTypeString",
                     "alias": "DISTRICT",
                     "length": 50
                    }
                 ],
                 "features": [
                    {
                     "attributes": {
                    "DISTRICT": "City of Milwaukie"
                     }
                    }
                 ]
                }
                */
                if (!result.features ||
                    result.features.length !== 1 ||
                    !result.features[0].attributes) {
                    console.log('No water district info found');
                    $('#water-district').text('Out of service area');
                    return;
                }

                console.log(result.features[0].attributes.DISTRICT);
                $('#water-district').text(result.features[0].attributes.DISTRICT);
                //lookupDistrictDetails(result.features[0].attributes.DISTRICT);

            } catch (e) {
                console.error('JSON.parse: ' + e.message);
            }
        }
    });
}
