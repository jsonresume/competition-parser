var mongo = require(__dirname + '/database');

var config = require(__dirname + '/config');

var worker = require('tweets-mongodb-parser');

var Twit = require('twit');

function parseTwitterDate(text)
{
  return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}
console.log(config);
mongo.get().then(function(db) {
    process.nextTick(function() {

      // poll search API

      new worker(db, {
        creds : config.twitterCreds,
        entries: config.entries,
        match : config.tweet_processor_match.join(' OR '),
        check_interval : config.tweet_processor_interval,
        batch_size : config.tweet_processor_batch_size,
        account_blacklist : config.tweet_processor_account_blacklist,
      }).start();

      // watch stream API as well, to scrape up anything the search API misses

      var twit = new Twit(config.twitterCreds);
    var stream = twit.stream('statuses/filter', { track : config.tweet_processor_match.join(',') });
    var coll = db.collection('tweets');

    var u, tweet;
    stream.on('tweet', function(status) {
      u = status.user;
      var vote = null;
      config.entries.forEach(function(entry){
        if(status.text.indexOf(entry) !== -1) {
          vote = entry;
        }
      });
      tweet = {
        _id : status.id_str,
        id_str: status.id_str,
        created_at : parseTwitterDate(status.created_at),
        text : status.text,
        username : u.screen_name,
        vote: vote,
        user : {
          id : u.id,
          name : u.name,
          screen_name : u.screen_name,
          location : u.location,
          description : u.description,
          url : u.url,
          followers_count : u.followers_count,
          friends_count : u.friends_count,
          time_zone : u.time_zone,
          profile_image_url : u.profile_image_url.replace(/^https?:/i, ''),
        }
      };

      coll.save(tweet, { w : 0 });
    });

    stream.on('limit', function(message) {
      // log something if we are rate limited. The client will adjust automatically to compensate.
      console.warn('Exceeded stream limit - missed ' + message.limit.track + ' tweets');
    });
    });
}, function(err) {
  throw err;
});