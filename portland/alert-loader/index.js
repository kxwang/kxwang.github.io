var Twitter = require('twitter');
var JsonApiStub = require('./jsonapi_stub')

var client = new Twitter({
    consumer_key: 'GGM0g7EgY6pDkJRTiPW4uBsxX',
    consumer_secret: 'XMQ2qNWqE7ecCsSvCaGNYpI4M79MC5qND23i2mILP7xkkrsBJC',
    access_token_key: '78668646-iORHHAg2BD0W8NNuZ78WSOanGCHY4PiTlqNuJwXho',
    access_token_secret: 'DgrFq41IzXe0ite5W0UgBlzSOEUi83rbwLviV00pIWawg'
});

var twitter_sources = require('./twitter_sources');

// Create a map with screen name as the key
var twitterScreenNameMap = new Map();
twitter_sources.nodes.forEach(function (item) {
    // Remove the @ sign and conver to lower case. Twitter screen name is case INSENSITIVE
    item.node['Twitter Handle'] = item.node['Twitter Handle'].substring(1).toLowerCase();
    twitterScreenNameMap.set(item.node['Twitter Handle'], item.node);
})

var twitterUserIDs = [];
var userIds = twitter_sources.nodes.map(function (item) { return item.node['Twitter Handle'] });
//console.log(userIds.join());

client.post('users/lookup', { screen_name: userIds.join() }, function (error, users) {
    twitterUserIDs = users.map(function (user) {
        return user.id;
    });
    startListening(twitterUserIDs);
})


// for (var [key, value] of twitterScreenNameMap) {
//     console.log(key + ' = ' + JSON.stringify(value));
// }

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/

//var twitterUserIDs = [14604442, 125789932, 5652522, 78668646];
var stream = null;
var timer = null;
var calm = 1;

function restart() {
    calm = 1;
    clearTimeout(timer);
    if (stream !== null && stream.active) {
        stream.destroy();
    } else {
        startListening();
    }
}

var dataCount = 0;

function startListening() {
    client.stream('statuses/filter', { follow: twitterUserIDs.join() }, function (newStream) {

        stream = newStream;

        stream.on('data', function (tweet) {
            console.log(new Date().toLocaleString(), '--------------- dataCount = ', ++dataCount);
            if (tweet.retweeted_status ||            // is retweet
                tweet.in_reply_to_status_id ||      // is reply
                twitterUserIDs.indexOf(tweet.user.id) === -1 // is not from the user list we track
            ) {
                console.log('retweet or reply ignored: '); // + tweet.text);
                return;
            }

            tweet.user.screen_name = tweet.user.screen_name.toLowerCase();
            if (!twitterScreenNameMap.has(tweet.user.screen_name)) {
                console.log('Cannot find screen name:' + tweet.user.screen_name);
                return;
            }
            var searchTerm = twitterScreenNameMap.get(tweet.user.screen_name)['Search Terms'];
            console.log(tweet.user.screen_name, searchTerm);

            if (searchTerm) {
                if (searchTerm.indexOf(',') === -1) {
                    if (tweet.text.indexOf(searchTerm) === -1) {
                        console.log('filtered out by keyword: ' + tweet.text);
                        return;
                    }
                }
                else {
                    var terms = searchTerm.split(',')
                        .map(function (str) { return str.trim(); })
                        .filter(function (str) { return (str.length > 0); });
                    var foundTerm = terms.some(function (term) {
                        return tweet.text.indexOf(term) >= 0;
                    });
                    if (!foundTerm) {
                        console.log('filtered out by keyword: ' + tweet.text);
                        return;
                    }
                }
            }
            console.log(new Date().toLocaleString(), '===================================');
            //console.log(tweet);

            // Convert Tweet to Alert
            var alert = {
                title: tweet.text,
                body: tweet.text,
                link: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                sourceTypeName: 'Twitter',
            };
            JsonApiStub.createAlert(alert);
        });

        stream.on('error', function (error) {
            console.log(error);
            if (err.message == 'Status Code: 420') {
                calm++;
            }
        });

        stream.on('end', function () {
            console.log('stream end event');
            stream.active = false;
            clearTimeout(timer);
            timer = setTimeout(function () {
                clearTimeout(timer);
                if (stream.active) {
                    stream.destroy();
                } else {
                    console.log('reconnect stream. calm=', calm);
                    startListening();
                }
            }, 1000 * calm * calm);
        });
    });
}


// Get timeline of a user

// var params = {
//     screen_name: 'tripcheckpdx', 
//     since_id: '948627318049669001',
//     trim_user: 1,
//     exclude_replies: 1,
//     include_rts: 0,
//     //count: 3
// };
// client.get('statuses/user_timeline', params, function(error, tweets, response) {
//  if (!error) {
//    console.log(tweets);
//  }
// });