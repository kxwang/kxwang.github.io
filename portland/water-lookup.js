
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


var waterGaugesGeoJson = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.276389,46.6175]},"properties":{"name":"Chehalis River near Adna","lid":"adnw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.472222,46.536111]},"properties":{"name":"Ahtanum Creek at Union Gap","lid":"ahuw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.106978,44.638611]},"properties":{"name":"Willamette River at Albany","lid":"albo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.1675,46.977778]},"properties":{"name":"American River (WA) near Nile","lid":"amrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.766667,46.208333]},"properties":{"name":"Columbia River at Tongue Pt near Astoria","lid":"asto3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.202778,47.3125]},"properties":{"name":"Green River (WA) near Auburn","lid":"aubw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.750278,45.233333]},"properties":{"name":"Pudding River at Aurora","lid":"auro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.178949,42.824843]},"properties":{"name":"Cow Creek near Azalea","lid":"azao3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.923056,46.772222]},"properties":{"name":"Skookumchuck River near Bucoda","lid":"bcdw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.300833,44.726389]},"properties":{"name":"Bridge Creek near Mitchell","lid":"bdgo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.845833,45.266667]},"properties":{"name":"Nestucca River near Beaver","lid":"beao3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.410833,43.930278]},"properties":{"name":"Deschutes River (OR) at Benham Falls","lid":"beno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.184722,46.830556]},"properties":{"name":"Black River (WA) at Hwy 12","lid":"blkw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.164167,47.3125]},"properties":{"name":"Big Soos Creek near Auburn","lid":"bskw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.136111,44.953611]},"properties":{"name":"Butte Creek near Fossil","lid":"btco3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.281111,46.88]},"properties":{"name":"Bumping River below Bumping Dam","lid":"bumw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.176667,43.715833]},"properties":{"name":"Silvies River near Burns","lid":"buso3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.6875,45.244167]},"properties":{"name":"Molalla River near Canby","lid":"cano3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.9125,46.274444]},"properties":{"name":"Cowlitz River at Castle Rock","lid":"casw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.978056,46.711667]},"properties":{"name":"Chehalis River at Centralia","lid":"cenw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.034444,46.776111]},"properties":{"name":"Chehalis River near Grand Mound","lid":"cgmw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.838889,46.444167]},"properties":{"name":"Cispus River near Randle","lid":"ciyw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.067864,47.244562]},"properties":{"name":"Yakima River at Cle Elum Outflow","lid":"clew1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.018056,46.900556]},"properties":{"name":"Naches River near Cliffdell","lid":"clfw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.603333,46.9625]},"properties":{"name":"Chehalis River at Montesano","lid":"cmtw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.578056,45.379722]},"properties":{"name":"Clackamas River near Oregon City","lid":"coco3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.124722,42.823333]},"properties":{"name":"Cow Creek above Azalea","lid":"cogo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-124.181794,43.157942]},"properties":{"name":"Coquille River at Coquille","lid":"coqo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.256944,44.566389]},"properties":{"name":"Willamette River at Corvallis","lid":"coro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.783333,43.75]},"properties":{"name":"Deschutes River (OR) below Crane Prairie Reservoir","lid":"crao3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.118889,46.806944]},"properties":{"name":"Chehalis River at Rochester","lid":"crow1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.587778,44.179167]},"properties":{"name":"Crooked River (OR) above Prineville Reservoir","lid":"crpo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.313056,46.939444]},"properties":{"name":"Chehalis River at Porter","lid":"crpw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.982778,46.661111]},"properties":{"name":"Chehalis River at WWTP at Chehalis","lid":"crww1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.953889,46.730278]},"properties":{"name":"Skookumchuck River at Centralia","lid":"ctaw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.297222,46.478611]},"properties":{"name":"Chehalis River near Pe Ell","lid":"ctkw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.108056,46.216667]},"properties":{"name":"Columbia River at Clover Island","lid":"cvrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.517222,42.745278]},"properties":{"name":"Cow Creek at Glendale","lid":"cwmo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.306667,44.083056]},"properties":{"name":"Deschutes River (OR) below Bend","lid":"debo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.28868,43.217894]},"properties":{"name":"Deer Creek at Roseburg","lid":"deeo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.250058,44.722061]},"properties":{"name":"N Santiam River at Detroit Lake","lid":"deto3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.125,45.474722]},"properties":{"name":"Tualatin River near Dilley","lid":"dllo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.276389,46.6175]},"properties":{"name":"Chehalis River near Doty","lid":"dotw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.6675,46.852222]},"properties":{"name":"Deschutes River near Rainier","lid":"dsrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.177778,47.238889]},"properties":{"name":"Yakima River at Easton","lid":"easw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.298333,43.640833]},"properties":{"name":"Elk creek near Drain","lid":"ecdo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.554167,43.586111]},"properties":{"name":"Umpqua River near Elkton","lid":"ekto3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.295556,46.634722]},"properties":{"name":"Elk Creek (WA) near Doty","lid":"elcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.354444,45.300556]},"properties":{"name":"Clackamas River near Estacada","lid":"esto3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.082778,44.0525]},"properties":{"name":"Willamette River at Eugene","lid":"eugo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.031389,47.028056]},"properties":{"name":"Carbon River near Fairfax","lid":"ffxw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.950278,45.449444]},"properties":{"name":"Tualatin River at Farmington","lid":"frmo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.755,45.703611]},"properties":{"name":"Nehalem River near Foss","lid":"fsso3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.809499,43.321508]},"properties":{"name":"North Umpqua River near Glide","lid":"glio3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.609722,42.804167]},"properties":{"name":"West Fork Cow Creek near Glendale","lid":"glno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.965278,43.980556]},"properties":{"name":"Coast Fork Willamette River at Goshen","lid":"goso3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.849442,47.305279]},"properties":{"name":"Green River (WA) at Purification Plant","lid":"gpuw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.581667,46.355]},"properties":{"name":"Grays River near Rosburg","lid":"grrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.177778,42.848889]},"properties":{"name":"Cow Creek at GALESVILLE RES","lid":"gsvo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.796667,47.283889]},"properties":{"name":"Green River (WA) below Howard Hanson Dam","lid":"hahw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.1739,44.27139]},"properties":{"name":"Willamette River at Harrisburg","lid":"haro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.792222,47.277222]},"properties":{"name":"Green River (WA) at Howard Hanson Reservoir","lid":"hhdw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.739167,47.124167]},"properties":{"name":"Yakima River at Horlick","lid":"hlkw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.548889,45.654722]},"properties":{"name":"Hood River near Hood River","lid":"hodo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.905556,43.998611]},"properties":{"name":"Mid Fork Willamette River at Jasper","lid":"jaso3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.014167,44.714722]},"properties":{"name":"Santiam River at Jefferson","lid":"jffo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.202222,47.261389]},"properties":{"name":"Yakima River at Kachess Outflow","lid":"kacw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.148611,44.856667]},"properties":{"name":"Warm Springs near Kahneeta Hot Springs","lid":"kaho3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.335,47.321389]},"properties":{"name":"Yakima River at Keechelus Outflow","lid":"keew1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.916111,46.1425]},"properties":{"name":"Cowlitz River at Kelso","lid":"kelw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.476944,46.253611]},"properties":{"name":"Yakima River at Kiona","lid":"kiow1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.243889,46.265]},"properties":{"name":"Klickitat River near Glenwood","lid":"klcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.501667,43.689167]},"properties":{"name":"Little Deschutes River near La Pine","lid":"lapo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.098611,46.9875]},"properties":{"name":"Little Naches River near Nile","lid":"lnrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.953889,46.105556]},"properties":{"name":"Columbia River at Longview","lid":"lopw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.7383,45.9056]},"properties":{"name":"Lewis River at Woodland","lid":"lrww1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.3875,47.181944]},"properties":{"name":"Green River (WA) above Twin Camp","lid":"ltcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.615,46.510556]},"properties":{"name":"Cowlitz River below Mayfield Dam","lid":"mayw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.1825,45.205556]},"properties":{"name":"South Yamhill River at McMinnville","lid":"mcmo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.771187,44.069849]},"properties":{"name":"McKenzie River near Walterville","lid":"mczo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.618611,44.789167]},"properties":{"name":"N Santiam River at Mehama","lid":"meho3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.559722,46.933611]},"properties":{"name":"Nisqually River at McKenna","lid":"mknw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.858611,47.146944]},"properties":{"name":"White River below Clearwater River","lid":"mmiw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.93,47.140833]},"properties":{"name":"White River at Mud Mtn. Dam - Outflow","lid":"mmrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.296389,44.313056]},"properties":{"name":"Long Tom River at Monroe","lid":"mnro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.654167,47.011667]},"properties":{"name":"Wynoochee River near Montesano","lid":"mnsw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.90562,45.622068]},"properties":{"name":"Deschutes River (OR) at Moody","lid":"modo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.430556,44.813889]},"properties":{"name":"North Fork John Day River near Monument","lid":"mono3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.882778,44.063333]},"properties":{"name":"Siuslaw River near Mapleton","lid":"mplo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.264722,47.189444]},"properties":{"name":"Crab Creek near Moses Lake","lid":"mslw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.033611,44.531389]},"properties":{"name":"Mountain Creek (OR) near Mitchell","lid":"mtno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.534722,44.316389]},"properties":{"name":"Murderers Creek near Dayville","lid":"muco3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-124.107844,43.068178]},"properties":{"name":"North Fk Coquille River near Myrtle Point","lid":"myno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-124.147048,43.065665]},"properties":{"name":"South Fk Coquille River at Myrtle Point","lid":"mypo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.768056,46.746667]},"properties":{"name":"Naches River near Naches","lid":"nacw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.742222,46.374167]},"properties":{"name":"Naselle River near Naselle","lid":"nasw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.943889,46.620278]},"properties":{"name":"Newaukum River near Chehalis","lid":"neww1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.0825,46.752778]},"properties":{"name":"Nisqually River near National","lid":"nisw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.2425,47.328333]},"properties":{"name":"North Fork Skokomish River near Potlatch","lid":"nspw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.433333,44.4]},"properties":{"name":"Ochoco Creek below Ochoco Reservoir","lid":"ocho3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.620556,45.348056]},"properties":{"name":"Willamette River above Falls at Oregon City","lid":"ocuo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.610833,45.3575]},"properties":{"name":"Willamette River below Falls at Oregon City","lid":"orco3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.206667,47.039444]},"properties":{"name":"Puyallup River near Orting","lid":"ortw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.678056,46.613056]},"properties":{"name":"Cowlitz River at Packwood","lid":"pacw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.441667,46.497222]},"properties":{"name":"Yakima River near Parker","lid":"parw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.246994,44.725952]},"properties":{"name":"Deschutes River (OR) near Madras","lid":"pero3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.334722,44.525]},"properties":{"name":"Marys River near Philomath","lid":"phio3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.311111,45.544444]},"properties":{"name":"Butter Creek near Pine City","lid":"pico3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.208889,45.756667]},"properties":{"name":"Klickitat River near Pitt","lid":"pitw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-124.069444,42.891667]},"properties":{"name":"South Fk Coquille River at Powers","lid":"powo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.863611,46.628889]},"properties":{"name":"Columbia River below Priest Rapids Dam","lid":"prdw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.671111,45.518333]},"properties":{"name":"Willamette River at Portland","lid":"prto3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.794444,44.113889]},"properties":{"name":"Crooked River (OR) near Prineville","lid":"prvo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.325833,47.208611]},"properties":{"name":"Puyallup River at Puyallup","lid":"puyw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.9569,46.5319]},"properties":{"name":"Cowlitz River at Randle","lid":"raww1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.428333,42.923611]},"properties":{"name":"Cow Creek near Riddle","lid":"rdlo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-124.095,43.705]},"properties":{"name":"Umpqua River at Reedsport","lid":"reeo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.349722,43.211111]},"properties":{"name":"South Umpqua River at Roseburg","lid":"rsbo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.140278,44.888889]},"properties":{"name":"Middle Fork John Day River at Ritter","lid":"rtro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.493611,47.000833]},"properties":{"name":"Satsop River near Satsop","lid":"satw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.727778,43.35]},"properties":{"name":"Steamboat Creek near Glide","lid":"scro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.081111,46.445]},"properties":{"name":"South Fork Chehalis Rver near Wildwood","lid":"scww1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.005556,44.793889]},"properties":{"name":"John Day River at Service Creek","lid":"sero3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.540556,44.423056]},"properties":{"name":"S. Fork John Day River near Dayville","lid":"sfjo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.79624,45.863611]},"properties":{"name":"Columbia River at St. Helens","lid":"shno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.888611,44.715278]},"properties":{"name":"Siletz River at Siletz","lid":"silo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.717222,46.784722]},"properties":{"name":"Skookumchuck River at Skookumchuck Reservoir","lid":"skrw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.0425,44.944167]},"properties":{"name":"Willamette River at Salem","lid":"slmo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.245,45.448611]},"properties":{"name":"Sandy River near Bull Run","lid":"sndo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.670833,43.672222]},"properties":{"name":"Silver Creek near Riley","lid":"snro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.091389,47.139722]},"properties":{"name":"South Prairie Creek at South Prairie","lid":"spew1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.956111,44.093056]},"properties":{"name":"Mohawk River (OR) near Springfield","lid":"spro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.543333,44.287778]},"properties":{"name":"Whychus Creek near Sisters","lid":"sqso3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.236944,47.316111]},"properties":{"name":"Skokomish River at Combined Forks Virtual Gage","lid":"srcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.468889,43.783889]},"properties":{"name":"Smith River near Drain","lid":"srdo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.175833,47.31]},"properties":{"name":"Skokomish River near Potlatch","lid":"srpw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.278889,47.340556]},"properties":{"name":"South Fork Skokomish River near Union","lid":"ssuw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.334722,42.951944]},"properties":{"name":"South Umpqua River near Riddle","lid":"suro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.234722,44.7825]},"properties":{"name":"Luckiamute River near Suver","lid":"suvo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.508333,45.4775]},"properties":{"name":"Johnson Creek near Sycamore","lid":"syco3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121,46.666667]},"properties":{"name":"Tieton River at Tieton Headworks","lid":"ticw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.831778,44.385954]},"properties":{"name":"Alsea River near Tidewater","lid":"tido3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.947222,42.930556]},"properties":{"name":"South Umpqua River near Tiller","lid":"tilo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.458333,46.595556]},"properties":{"name":"Tilton River near Cinebar","lid":"tilw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.725,45.475833]},"properties":{"name":"Wilson River near Tillamook","lid":"tlmo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.072222,45.125]},"properties":{"name":"Clackamas River above Three Lynx Creek","lid":"tlyo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.861111,47.246389]},"properties":{"name":"Teanaway River near Cle Elum","lid":"tnaw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.786944,46.311111]},"properties":{"name":"Toppenish Creek near Fort Simcoe","lid":"topw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.840833,46.335]},"properties":{"name":"Toutle River at Tower Road near Silver Lake","lid":"totw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.709167,45.446389]},"properties":{"name":"Trask River near Tillamook","lid":"trao3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.326962,45.90291]},"properties":{"name":"Umatilla River at Umatilla","lid":"umao3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.480067,46.862626]},"properties":{"name":"Yakima River at Umtanum","lid":"umtw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.696389,45.631389]},"properties":{"name":"Columbia River at Vancouver","lid":"vapw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.281944,45.806944]},"properties":{"name":"Nehalem River near Vernonia","lid":"veno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.469444,44.125278]},"properties":{"name":"McKenzie River near Vida","lid":"vido3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.228615,47.266109]},"properties":{"name":"White River near Auburn","lid":"wabw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.408333,46.161111]},"properties":{"name":"Columbia River at Wauna","lid":"wauo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.008056,47.173889]},"properties":{"name":"White River above Boise Ck","lid":"wbcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.683333,43.683333]},"properties":{"name":"Deschutes River (OR) below Wickiup Reservoir","lid":"wico3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.651667,46.651111]},"properties":{"name":"Willapa River at Willapa","lid":"wilw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.352778,43.283333]},"properties":{"name":"North Umpqua River at Winchester Dam","lid":"wino3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.411389,43.270833]},"properties":{"name":"North Umpqua River near Winchester","lid":"wnro3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.23722,47.260277]},"properties":{"name":"White River at Pacific","lid":"wpcw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.206667,47.275]},"properties":{"name":"White River at R St. Auburn","lid":"wraw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.236111,47.235556]},"properties":{"name":"White River near Dieringer","lid":"wrdw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.21888,47.271388]},"properties":{"name":"White River at Roegner Pk. nr Auburn","lid":"wrpw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.675,45.350833]},"properties":{"name":"Tualatin River at West Linn","lid":"wslo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.397222,43.133333]},"properties":{"name":"South Umpqua River near Winston","lid":"wsno3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.2422,47.250277]},"properties":{"name":"White River near Sumner","lid":"wstw1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.821944,44.497778]},"properties":{"name":"S. Santiam River at Waterloo","lid":"wtlo3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-119.035833,45.677222]},"properties":{"name":"Umatilla River near Yoakum","lid":"yoko3"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-120.947027,47.191231]},"properties":{"name":"Yakima River at Cle Elum","lid":"yumw1"}}]}
