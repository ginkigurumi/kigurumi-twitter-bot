'use strict';

var Twitter = require('twitter');

function SafeTwitter(options) {
  if("delay" in options && Number.isInteger(options.delay))
    this.delay = options.delay;
  else
    this.delay = 0;

  this.client = Twitter(options);
}

SafeTwitter.prototype.get = function(path, params, callback) {
  return this.sleep()
    .then(() => this.client.get(path, params, callback));
}

SafeTwitter.prototype.post = function(path, params, callback) {
  return this.sleep()
    .then(() => this.client.post(path, params, callback));
}

SafeTwitter.prototype.stream = function(path, params, callback) {
  return this.sleep()
    .then(() => this.client.stream(path, params, callback));
}

SafeTwitter.prototype.sleep = function() {
  // console.log('really sleeping...');
  return new Promise(resolve => setTimeout(resolve, this.delay));
}

module.exports = SafeTwitter;