require('dotenv').config()
var Twitter = require('twitter');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// config
let MIN_FAV = 10;
let FORCE_FETCH = false; // Will force fetch from Twitter regardless of the timeout
// end config

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var paramTemplate = {
  list_id: 83481953,
  slug: "kigurumi",
  owner_screen_name: "Aoi_chan121",
  include_rts: false,
  count: 10000,
  tweet_mode: "extended"
};

var allTweets = [];
var trendyTweets = [];
var exitFlag = false;
var now = new Date().getTime();
console.log('Fetching...');

trendyTweets.pushAndSave = function (item){
  trendyTweets.push(item);
  localStorage.setItem('trendyTweets', JSON.stringify(trendyTweets));
}

// getListStatus()
//   .then(() => {
//     trendyTweets.forEach((tweet) => {
//       console.log(tweet.user.name + " @" + tweet.user.screen_name + " ♥" + tweet.favorite_count + " RT" + tweet.retweet_count);
//       console.log(tweet.full_text);
//       console.log(tweet.url);
//       console.log("*");
//     });
//   })
//   .catch((err) => console.error);

var lastFetchTime = localStorage.getItem('lastFetchTime');

// Only crawl again after 15 minutes.
if (!FORCE_FETCH && lastFetchTime != null) {
  let diff = now - lastFetchTime;
  console.log('diff = '+ diff);
  if (diff < 1000*60*15) {
    console.log("Use cached info instead.");

    var cachedtrendyTweetsString = localStorage.getItem('trendyTweets');
    cachedtrendyTweets = JSON.parse(cachedtrendyTweetsString);
    console.log(cachedtrendyTweets);


    process.exit();
  }
}

localStorage.setItem('lastFetchTime', now);

getMemberList().then((users) => {
  let userParamTemplate = {
    screen_name: '',
    include_rts: false,
    count: 10000,
    tweet_mode: 'extended'
  };
  console.log(users.length+' users in list.');

  // Go through each member's profile and find good tweets ;)
  // Requests / 15-min window (app auth): 1500
  var firstTen = Array.from(users.slice(0, 10));
  firstTen.forEach((user) => {
    console.log(user.screen_name);
    var param = Object.assign({}, userParamTemplate);
    param.screen_name = user.screen_name;

    client.get('statuses/user_timeline', param).then((timeline) => {
      //console.log('Analyzing ' +timeline.length + ' tweets');
      timeline.forEach((status) => {
        if("entities" in status && "media" in status.entities) {
          if (status.favorite_count >= MIN_FAV) {

            trendyTweets.pushAndSave(status);
            console.log('@'+status.user.screen_name + 
              ' ' +status.full_text + 
              ' | ♥ ' + status.favorite_count + 
              ' | RT '+ status.retweet_count+ 
              ' ('+status.id+')');
          }
        }
      });
    });
  });
});

// Print format functions

// TODO

// Util Functions
function getMemberList() {
  let param = Object.assign({}, paramTemplate);
  return sleep(2000)
    .then(() => client.get('lists/members', param))
    .then((members) => {
      return members.users;
    });
}

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

          if(status.favorite_count < MIN_FAV)
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