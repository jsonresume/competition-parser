/**
 * Config for backend limits, thresholds, database etc
 * Also a layer of indirection above env variables to allow easy overrides during dev.
 */
module.exports = {
  server_port : process.env.PORT,

  mongo_connection_uri : process.env.MONGOHQ_URL,


  tweet_processor_interval : 15000,
  tweet_processor_batch_size : 100,
  tweet_processor_match : ['jsonresume.org'],
  tweet_processor_account_blacklist : [

  ],

  twitterCreds : {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
  },

  entries: ['#flat', '#modern', '#elegant', '#classy', '#kendall', '#class', '#paper'],

  mongoSetup : {
    // configure collections to prepopulate
    collectionsAndIndexes : {
      tweets : [
        { "user.followers_count" : 1 },
        { "user.screen_name" : 1 },
      ]
    }
  },
};