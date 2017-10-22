'use strict';

require('dotenv').config();
const moment = require('moment');
const SafeTwitter = require('./lib/safeTwitter');
const storage = require('node-persist');

const client = new SafeTwitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
  delay: 1000
});

const botClient = new SafeTwitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  delay: 0
});

// config
const ENABLE_BOT = true;

const MIN_FAV = 100;
const FROM_N_SECS_AGO = 60*60*24*10;

// templates
const paramTemplate = {
  slug: "subscribe",
  owner_screen_name: "kigurumihub",
  include_rts: false,
  count: 10000,
  tweet_mode: "extended"
};

const userParamTemplate = {
  screen_name: '',
  include_rts: false,
  count: 10000,
  tweet_mode: 'extended'
}

const storageOptions = {
  dir: 'persist',
  ttl: FROM_N_SECS_AGO * 1000
}

// main
storage.init(storageOptions)
  .then(crawl)
  .catch(console.error);

function crawl() {
  return getUserFromList()
    .then((users) => users.reduce(crawlUser, Promise.resolve()))
    .then(crawl);
}

function crawlUser(chain, user) {
  return chain.then(() => getUserTimeline(user))
    .then((timeline) => timeline.filter(trendyTweetFilter))
    .then((timeline) => timeline.reduce(handleTrendyTweet, Promise.resolve()));
}

function handleTrendyTweet(chain, tweet) {
  printTweet(tweet);

  // handled before, skip
  if(storage.getItemSync(tweet.id_str) !== undefined)
    return chain;

  if(ENABLE_BOT){
    return chain
      .then(() => retweet(tweet))
      .then(() => favourite(tweet))
      .then(() => {
        // persist favourite / retweet -ed item
        return storage.setItem(tweet.id_str, {
          screen_name: tweet.user.screen_name
        });
      });
  } else {
    return chain;
  }
}

// utils
function getUserFromList() {
  let param = Object.assign({}, paramTemplate);
  return client.get('lists/members', param)
    .then((members) => members.users)
    .then((users) => {
      console.log(users.length + ' users in list.');
      return users;
    })
    .catch((err) => console.error('[ERROR] lists/members fail', err));
}

function getUserTimeline(user) {
  let param = Object.assign({}, userParamTemplate);
  param.screen_name = user.screen_name;
  return client.get('statuses/user_timeline', param)
    .catch((err) => {
      console.error('[ERROR] statuses/user_timeline fail: @' + user.screen_name, err);
      return [];
    });
}

function trendyTweetFilter(tweet) {
  if("entities" in tweet && "media" in tweet.entities)
    if (tweet.favorite_count >= MIN_FAV) {
      var created_at = moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');

      if(created_at.isAfter(moment().subtract(FROM_N_SECS_AGO, 'seconds')))
        return true;
    }

  return false;
}

function retweet(tweet) {
  return botClient.post('statuses/retweet/' + tweet.id_str, {})
    .catch((errors) => {
      // "message": "You have already retweeted this tweet."
      // if(Array.isArray(errors) && errors.length === 1 && 'code' in errors[0] && errors[0].code === 327)
      //   return;
      console.error('[ERROR] statuses/retweet fail: @' + tweet.user.screen_name + ' ' + tweet.id_str, errors)
    });
}

function favourite(tweet) {
  return botClient.post('favorites/create', {id: tweet.id_str})
    .catch((errors) => {
      // "message": "You have already favorited this status."
      // if(Array.isArray(errors) && errors.length === 1 && 'code' in errors[0] && errors[0].code === 139)
      //   return;
      console.error('[ERROR] favorites/create fail: @' + tweet.user.screen_name + ' ' + tweet.id_str, errors)
    });
}

function printTweet(tweet) {
  console.log('@'+tweet.user.screen_name + 
              ' ' +tweet.full_text + 
              ' | ♥ ' + tweet.favorite_count + 
              ' | RT '+ tweet.retweet_count+ 
              ' ('+tweet.id_str+')');
}