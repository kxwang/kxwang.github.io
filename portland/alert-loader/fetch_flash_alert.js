var parseString = require('xml2js').parseString;
var util = require('util')
var request = require('request'); // for fetching the feed

var req = request('http://www.craigwalker.net/IIN/reportsX/flashnews_xml2.php', function (error, response, body) {
    if (error) {
        console.log('error:', error); // Print the error if one occurred
        return;
    }
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    if (response.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
    }
    else {
        //https://www.screenaware.com/en/blog/xml2js-sax-js-non-whitespace-before-first-tag
        var cleanedString = body.replace("\ufeff", "");
        parseString(cleanedString, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            //console.dir(result);

            /* This is an example of the JSON format of one item in the result array
            var item = {
                '$':
                    {
                        news_id: '110271',
                        testing: '0',
                        effective_date: '2017-12-08 11:32:16'
                    },
                orgname:
                    [{
                        _: 'Oregon Parks and Recreation Dept.',
                        '$': { orgid: '1303', tier: '1', zipcode: '97301' }
                    }],
                headline:
                    ['Free First Day Hike at Historic Columbia River Highway State Trail Jan. 1'],
                detail:
                    ['Mosier OR -- For the seventh year in a row, the Oregon Parks and Recreation Department (OPRD) is partnering with America\'s State Parks to offer free guided First Day Hikes in state parks across Oregon on New Year\'s Day. Information about the special hike hosted at Historic Columbia River Highway State Trail is below. The usual $5 parking fee will be waived Jan. 1 only.\r\n\r\nHikers can register for the hike at the Oregon State Parks Store, http://bit.ly/ColumbiaRiverTrailFDH2018 . Online registration is new this year--although not required--and will help park staff plan for the hike and provide them with participant contact information should hike details change. \r\n\r\nHike time: Noon\r\nStarting location: Mark O. Hatfield Visitors Center West Trailhead\r\nTerrain and length of trail: Moderate, four-mile hike. We recommend this hike for children at least 12 years old, unless supervised by an adult. Dogs permitted on a 6-foot leash. Be prepared for icy and/or snowy trail conditions.     \r\nContact information:(541) 374-8811 \r\nAdditional details: Learn about the plants and animals that call the Gorge ecosystem home, as well as how this wonder of the Northwest was formed.\r\n\r\nParticipants should dress in layers, wear sturdy shoes, and bring water as well as a camera or binoculars for wildlife viewing. \r\n\r\nShare photos of First Day Hikes via Twitter and Instagram by using the hashtag #ORfirstdayhikes or tagging "Oregon State Parks" on Facebook.' ] },
            */

            //console.log(util.inspect(result, false, null));
            console.log(result.flashnews.news[0].news_category[0]);
        });
    }
});
