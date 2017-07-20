# Prerequisite
* Node.js
* npm

# Set Up

Create `.env`

```
TWITTER_CONSUMER_KEY=XXXXXX
TWITTER_CONSUMER_SECRET=XXXXXX
TWITTER_ACCESS_TOKEN_KEY=XXXXXX
TWITTER_ACCESS_TOKEN_SECRET=XXXXXXX
```

Obtained at https://dev.twitter.com/oauth/overview

# Run the project

1. `npm install`
2. `node index`

# Program Flow

1. Read members from a predefined list
2. Crawl the timeline of each member in the list
3. Filter out tweets with media only
4. Filter tweets with high `favourites_count` and `retweet_count`
5. Display the tweets
