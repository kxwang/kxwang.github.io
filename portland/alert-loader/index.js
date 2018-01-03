var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'GGM0g7EgY6pDkJRTiPW4uBsxX',
    consumer_secret: 'XMQ2qNWqE7ecCsSvCaGNYpI4M79MC5qND23i2mILP7xkkrsBJC',
    access_token_key: '78668646-iORHHAg2BD0W8NNuZ78WSOanGCHY4PiTlqNuJwXho',
    access_token_secret: 'DgrFq41IzXe0ite5W0UgBlzSOEUi83rbwLviV00pIWawg'
});

var twitter_sources = require('./twitter_sources');

// Create a map with screen name as the key
var twitterScreenNameMap = new Map();
twitter_sources.nodes.forEach(function(item){
    item.node['Twitter Handle'] = item.node['Twitter Handle'].substring(1); // Remove the @ sign
    twitterScreenNameMap.set(item.node['Twitter Handle'], item.node);
})

var twitterUserIDs = [];
var userIds = twitter_sources.nodes.map(function (item) { return item.node['Twitter Handle'] });
console.log(userIds.join());

client.post('users/lookup', { screen_name: userIds.join() }, function (error, users) {
    twitterUserIDs = users.map(function (user) {
        return user.id;
    });
    startListening(twitterUserIDs);
})


for (var [key, value] of twitterScreenNameMap) {
    console.log(key + ' = ' + JSON.stringify(value));
  }

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/

//var twitterUserIDs = [14604442, 125789932, 5652522, 78668646];

function startListening(twitterUserIDs) {
    console.log(twitterUserIDs.join());
    client.stream('statuses/filter', { follow: twitterUserIDs.join() }, function (stream) {
        stream.on('data', function (tweet) {
            if (tweet.retweeted_status ||            // is retweet
                tweet.in_reply_to_status_id ||      // is reply
                twitterUserIDs.indexOf(tweet.user.id) === -1 // is not from the user list we track
            ) {
                console.log('retweet or reply ignored');
                return;
            }
            console.log(tweet.user.screen_name);
            console.log(twitterScreenNameMap.get(tweet.user.screen_name)['Search Terms']);

            var searchTerm = twitterScreenNameMap.get(tweet.user.screen_name)['Search Terms'];
            if(searchTerm.indexOf(',') === -1) {
                if(tweet.text.indexOf(searchTerm) === -1){
                    console.log('filtered out by keyword');
                    return;
                }
            }
            else {
                var terms = searchTerm.split(',')
                            .map(function(str) { return str.trim(); })
                            .filter(function(str) { return (str.length > 0); });
                var foundTerm = terms.some(function(term){
                    return tweet.text.indexOf(term) >= 0;
                });
                if(!foundTerm) {
                    console.log('filtered out by keyword');
                    return;
                }
            }

            console.log(tweet);
        });

        stream.on('error', function (error) {
            console.log(error);
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