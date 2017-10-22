'use strict';

require('dotenv').config({path: '../.env'});
const fs = require('fs');

const SafeTwitter = require('../lib/safeTwitter');

const botClient = new SafeTwitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  delay: 1000
});

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
if(typeof config.fromList !== 'object' || typeof config.toList !== 'object')
  throw new Error('Wrong/missing .config');

getNewUsers()
  .then((userIds) => userIds.chunk(100))
  .then((chunkedUserIds) => chunkedUserIds.reduce(addUsersToList, Promise.resolve()))
  .catch(console.error);

function getNewUsers() {
  let fromListUserIds;

  return getUserFromList(config.fromList)
    .then((users) => users.map((user) => user.id_str))
    .then((ids) => fromListUserIds = ids)
    .then(() => getUserFromList(config.toList))
    .then((users) => users.map((user) => user.id_str))
    .then((existingUserIds) => fromListUserIds.filter((u) => existingUserIds.indexOf(u) === -1))
    .then((newUsers) => {
      console.log('new users count: ' + newUsers.length);
      console.log('newUsers: ', newUsers);
      return newUsers;
    })
}

function getUserFromList(list) {
  let paramTemplate = {
    include_rts: false,
    count: 10000,
    tweet_mode: "extended"
  };

  let param = Object.assign({}, paramTemplate);

  param.slug = list.slug;
  param.owner_screen_name = list.owner_screen_name;

  return botClient.get('lists/members', param)
    .then((members) => members.users)
    .then((users) => {
      console.log(users.length + ' users in list ' + param.owner_screen_name + '/' + param.slug);
      return users;
    })
    .catch((err) => console.error('[ERROR] lists/members fail', err));
}

function addUsersToList(chain, userIds) {
  let param = Object.assign({}, config.toList);
  param.user_id = userIds.join(',');

  console.log('addUsersToList:', param.user_id);

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