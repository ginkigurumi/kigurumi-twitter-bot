require('dotenv').config()
var Twitter = require('twitter');

// config
var minFavourite = 10;
// end config

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var paramTemplate = {
  // list_id: 83481953,
  slug: "kigurumi",
  owner_screen_name: "Aoi_chan121",
  include_rts: false,
  count: 10000,
  tweet_mode: "extended"
};

var trendyTweets = [];
var exitFlag = false;

getListStatus()
  .then(() => {
    trendyTweets.forEach((tweet) => {
      console.log(tweet.user.name + " @" + tweet.user.screen_name + " ♥" + tweet.favorite_count + " RT" + tweet.retweet_count);
      console.log(tweet.full_text);
      console.log(tweet.url);
      console.log("*");
    });
  })
  .catch((err) => console.error);

function getListStatus(_max_id) {
  let param = Object.assign({}, paramTemplate);
  if(_max_id !== undefined)
    param.max_id = _max_id;

  return sleep(2000)
    .then(() => client.get('lists/statuses', param))
    .then((statuses) => {
      if(statuses.length == 0)
        return;

      statuses.forEach((status) => {
        if("entities" in status && "media" in status.entities) {
          // console.log("retweet_count: " + status.retweet_count);
          // console.log("favorite_count: " + status.favorite_count);
          // status.entities.media.forEach((media) => {
          //   console.log("url: " + media.url);
          // })
          // console.log("*");

          if(status.favorite_count < minFavourite)
            return;

          let tweet = {
            retweet_count: status.retweet_count,
            favorite_count: status.favorite_count,
            user: {
              name: status.user.name,
              screen_name: status.user.screen_name
            },
            full_text: status.full_text,
            url: status.entities.media[0].url   // TODO
          };

          trendyTweets.push(tweet);
        }
      });

      let lastStatus = statuses[statuses.length - 1];
      let max_id = lastStatus.id;

      console.log("[DEBUG] timestamp: " + lastStatus.created_at);

      // temp terminate condition lol
      if(lastStatus.created_at.indexOf("Jul 19") === -1)
        return;
      else
        return getListStatus(max_id);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}