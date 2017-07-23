'use strict';

require('dotenv').config();

const SafeTwitter = require('../lib/safeTwitter');

const botClient = new SafeTwitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  delay: 1000
});

const fromParamTemplate = {
  slug: "test",
  owner_screen_name: "kigurumihub_sb2",
  include_rts: false,
  count: 10000,
  tweet_mode: "extended"
};

const toParamTemplate = {
  slug: "test2",
  owner_screen_name: "kigurumihub_sb2"
};

getUserFromList()
  .then((users) => users.map((user) => user.id_str))
  .then((userIds) => userIds.chunk(100))
  .then((chunkedUserIds) => chunkedUserIds.reduce(addUsersToList, Promise.resolve()))
  .catch(console.error);

function getUserFromList() {
  let param = Object.assign({}, fromParamTemplate);
  return botClient.get('lists/members', param)
    .then((members) => members.users)
    .then((users) => {
      console.log(users.length + ' users in list.');
      return users;
    })
    .catch((err) => console.error('[ERROR] lists/members fail', err));
}

function addUsersToList(chain, userIds) {
  let param = Object.assign({}, toParamTemplate);
  param.user_id = userIds.join(',');

  console.log(param.user_id);

  return chain
    .then(() => botClient.post('lists/members/create_all', param))
    .catch((err) => console.error('[ERROR] lists/members/create_all fail', err));
}

// helper function for split into chunks
Array.range = function(n) {
  // Array.range(5) --> [0,1,2,3,4]
  return Array.apply(null,Array(n)).map((x,i) => i)
};

Object.defineProperty(Array.prototype, 'chunk', {
  value: function(n) {

    // ACTUAL CODE FOR CHUNKING ARRAY:
    return Array.range(Math.ceil(this.length/n)).map((x,i) => this.slice(i*n,i*n+n));

  }
});