# Prerequisite
* Node.js
* npm

# Set Up

1. Create Twitter app: https://apps.twitter.com

2. Obtain `TWITTER_CONSUMER_KEY` & `TWITTER_CONSUMER_SECRET` by: https://dev.twitter.com/oauth/application-only

3. Create a new Twitter user for retweet bot

4. Use [twurl](https://github.com/twitter/twurl) to generate `TWITTER_ACCESS_TOKEN_KEY` & `TWITTER_ACCESS_TOKEN_SECRET`, which is stored in `~/.twurlrc`

5. Create `.env`

```
TWITTER_CONSUMER_KEY=XXXXXX
TWITTER_CONSUMER_SECRET=XXXXXX
TWITTER_ACCESS_TOKEN_KEY=XXXXXX
TWITTER_ACCESS_TOKEN_SECRET=XXXXXXX
TWITTER_BEARER_TOKEN=XXXXXXX
```


# Run the project

## Generate static webpage

1. `npm install`
2. `node index`

## Run retweet bot

1. `npm install`
2. `node bot`

# Program Flow

1. Read members from a predefined list
2. Crawl the timeline of each member in the list
3. Filter out tweets with media only
4. Filter tweets with high `favourites_count` and `retweet_count`
5. Display the tweets
6. Favourite and retweet if retweet bot is configured