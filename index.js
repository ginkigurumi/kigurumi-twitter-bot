require('dotenv').config()
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var param = {
  // list_id: 83481953,
  slug: "kigurumi",
  owner_screen_name: "Aoi_chan121",
  include_rts: false,
  count: 10000,
  tweet_mode: "extended"
}

client.get('lists/statuses', param)
  .then((statuses) => {
    statuses.forEach((status) => {
      if("entities" in status && "media" in status.entities) {
        console.log("retweet_count: " + status.retweet_count);
        console.log("favorite_count: " + status.favorite_count);
        status.entities.media.forEach((media) => {
          console.log("url: " + media.url);
        })
        console.log("*")
      }
    })
  })