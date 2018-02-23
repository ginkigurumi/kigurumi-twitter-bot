#!/bin/bash
BASEDIR=$(dirname "$0")
/usr/local/bin/forever stop $BASEDIR/bot.js
/usr/local/bin/forever start $BASEDIR/bot.js
