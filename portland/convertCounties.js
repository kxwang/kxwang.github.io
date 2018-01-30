
var fs = require('fs');
var waCounties = JSON.parse(fs.readFileSync('County_Boundaries_Washington.geojson', 'utf8'));
var countiesArray = waCounties.features.filter(function (item) {
    item.properties.name = item.properties.JURLBL;
    return ['Clark', 'Cowlitz', 'Skamania', 'Wahkiakum'].includes(item.properties.JURLBL);
})

var orCounties = JSON.parse(fs.readFileSync('oregon.county.geojson', 'utf8'));
countiesArray = countiesArray.concat(orCounties.features.filter(
    function (item) {
        return ['Multnomah', 'Clackamas', 'Columbia', 'Washington', 'Linn', 'Benton', 'Marion']
            .some(name => {
                if(item.properties.name.indexOf(name) == 0) {
                    item.properties.name = name;
                    return true;
                }
                return false;
            });
    })
)

var geoJsonObj = {
    "type": "FeatureCollection",
    "features": countiesArray
}

console.log(JSON.stringify(geoJsonObj));