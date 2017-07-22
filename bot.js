'use strict';

require('dotenv').config()
const SafeTwitter = require('./lib/safeTwitter');

const client = new SafeTwitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
  delay: 1000
});

// config
const MIN_FAV = 100;

// templates
const paramTemplate = {
  list_id: '888396394922352640',
  slug: "kigurumi",
  owner_screen_name: "inorihestia",
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

// main
crawl()
  .catch(console.error);

function crawl() {
  return getUserFromList()
    .then((users) => users.reduce(crawlUser, Promise.resolve()))
    .then(crawl);
}

function crawlUser(chain, user) {
  return chain.then(() => getUserTimeline(user))
    .then((timeline) => timeline.filter(trendyTweetFilter))
    .then((timeline) => timeline.forEach(handleTrendyTweet));
}

function handleTrendyTweet(tweet) {
  printTweet(tweet);
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
      console.error('[ERROR] statuses/user_timeline fail: @', user.screen_name + ' ' + err.message);
      return [];
    });;
}

function trendyTweetFilter(tweet) {
  if("entities" in tweet && "media" in tweet.entities)
    if (tweet.favorite_count >= MIN_FAV)
      return true;

  return false;
}

function printTweet(tweet) {
  console.log('@'+tweet.user.screen_name + 
              ' ' +tweet.full_text + 
              ' | ♥ ' + tweet.favorite_count + 
              ' | RT '+ tweet.retweet_count+ 
              ' ('+tweet.id_str+')');
}