var util = require('util')
var request = require('request'); // for fetching the feed

var req = request(
    {
        url: 'https://api.weather.gov/alerts?active=1&state=or',
        headers: {
            // Requred header. Will get a 403 error without it
            'User-Agent': 'CityOfPortland/v1.0 (http://portlandoregon.gov; xinju.wang@portlandoregon.gov)',
            // Required header. Will get 500 without it
            'Accept': 'application/ld+json;version=1'
        }
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error); // Print the error if one occurred
            return;
        }
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if (response.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
        }
        else {
            var result = JSON.parse(body);
            console.log(result.features);
        }
    }
);
