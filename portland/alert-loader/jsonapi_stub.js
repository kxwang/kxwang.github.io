var request = require('request');


var alertLocationTagMap = {
    'Multinomah': '514e71fd-c1f8-44ff-a238-f96fa57701ba',
    'Washington': '9761a5db-a1da-4d23-9c52-676a78eec324',
    'Clackamas': '0a413500-d980-4e60-bece-c255030d3b56',
    'Clark': '730ff6e5-de10-418b-b966-a2675c129f0c',
    'Columbia': 'ec9b646d-cf2e-46bf-b83e-bca2185b68e4',
    'Portland': 'c813da00-afbe-46d2-8a0d-f70afa049246',
    'Vancouver': '64de1946-bb5a-47b0-9668-0eeb5177266c',
    'Beaverton': '3d664834-ae37-47e0-be50-d743681e9210',
    'Tigard': '4deea5f0-8851-42fa-a1ae-7b4b132490b3',
}

var alertSourceTypeMap = {
    'Flash Alert': '46e78ce2-e2ae-478d-a369-799adc8bbc8c',
    'Twitter': '61790239-f7fc-43df-805e-2ad43d25c1dd',
    'TripCheck JSON': '41930f92-4872-44cc-88d0-f7e1bdc607bc',
}

module.exports = {
    createAlert: function (alert) {
        request({
            method: 'POST',
            headers: {
                'Accept': "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
            },
            url: 'http://www.pccep2.local/jsonapi/node/alert',
            json: true,
            body: {
                "data": {
                    "type": "node--alert",
                    "attributes": {
                        "title": alert.title,
                        "body": {
                            "value": alert.body,
                            "format": "plain_text"
                        },
                        "field_alert_link": {
                            "uri": alert.link,
                            "title": "For more info",
                            "options": []
                        },
                        // "field_geolocation": {
                        //     "lat": 22.222222,
                        //     "lng": -117.777777

                        // },
                        // "field_number_of_user_impacted": 100
                    },
                    "relationships": {
                        "uid": {
                            "data": {
                                "type": "user--user",
                                "id": "36fe24f7-40e9-4ddd-8cac-e63681d55797"
                            }
                        },
                        "field_alert_source_type": {
                            "data": {
                                "type": "taxonomy_term--alert_source_type",
                                "id": alertSourceTypeMap[alert.sourceTypeName]
                            }

                        }
                    }
                }
            }
        }, function (error, response, body) {
            if(error) console.log(error)
            console.log(response.statusCode);
        });

    },
};