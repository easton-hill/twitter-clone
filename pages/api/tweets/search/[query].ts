import type { NextApiRequest, NextApiResponse } from 'next'
import { Tweet, TwitterTweet, TwitterUser } from 'utils'

type Data = {
  tweets: Tweet[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // get the string to search for from the request
  const { query } = req.query
  console.log(query)

  // constants
  const baseURL = 'https://api.twitter.com/2/tweets/search/recent?query='
  const operators = [query, '-is:retweet', '-is:reply', 'is:verified', 'lang:en']
  const params = [
    'expansions=attachments.media_keys,author_id,entities.mentions.username,referenced_tweets.id,referenced_tweets.id.author_id',
    'media.fields=url,public_metrics,alt_text',
    'tweet.fields=conversation_id,created_at,entities,public_metrics,reply_settings',
    'user.fields=protected,public_metrics,verified',
    'max_results=10',
  ]

  // HTTP encoding
  const encodedQuery = `${operators.join('%20').replace(/:/g, '%3A')}&${params.join('&')}`

  const response = await fetch(
   `${baseURL}${encodedQuery}`, {
      headers: new Headers({
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      })
    }
  )
  const json = await response.json()
  console.log(json)


  // parse the tweets
  const tweetsArray = json.data
  const tweets: Tweet[] = []

  tweetsArray.forEach((twitterTweet: TwitterTweet) => {
    // get the corresponding user object for the tweet's author
    const userObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === twitterTweet.author_id
    )

    const tweet: Tweet = {
      id: twitterTweet.id,
      created_at: twitterTweet.created_at,
      text: twitterTweet.text,
      conversation_id: twitterTweet.conversation_id,
      reply_setting: twitterTweet.reply_settings,
      metrics: {
        retweet_count: twitterTweet.public_metrics.retweet_count,
        quote_count: twitterTweet.public_metrics.quote_count,
        like_count: twitterTweet.public_metrics.like_count,
        reply_count: twitterTweet.public_metrics.reply_count,
      },
      author: {
        id: userObject.id,
        username: userObject.username,
        name: userObject.name,
        verified: userObject.verified,
        protected: userObject.protected,
        metrics: {
          followers_count: userObject.public_metrics.followers_count,
          following_count: userObject.public_metrics.following_count,
          tweet_count: userObject.public_metrics.tweet_count,
        }
      }
    }

    tweets.push(tweet)
  })


  /*
  const tweet: Tweet = {
    id: tweetData.id,
    created_at: tweetData.created_at,
    text: tweetData.text,
    conversation_id: tweetData.conversation_id,
    reply_settings: tweetData.reply_settings,
    metrics: {
      retweet_count: tweetData.public_metrics.retweet_count,
      quote_count: tweetData.public_metrics.quote_count,
      like_count: tweetData.public_metrics.like_count,
      reply_count: tweetData.public_metrics.reply_count
    },
    author: {
      id: authorData.id,
      username: authorData.username,
      name: authorData.name,
      verified: authorData.verified,
      protected: authorData.protected,
      metrics: {
        followers_count: authorData.public_metrics.followers_count,
        following_count: authorData.public_metrics.following_count,
        tweet_count: authorData.public_metrics.tweet_count
      }
    }
  };
  */

  res.status(200).json({ tweets: tweets }) 
}
