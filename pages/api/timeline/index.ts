import type { NextApiRequest, NextApiResponse } from 'next'
import { Tweet, TwitterTweet, TwitterUser, createOAuthString } from 'utils'

type Data = {
  tweets: Tweet[]
  next_token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // optional token for pagination
  const { token } = req.query

  const baseUrl = `https://api.twitter.com/2/users/${process.env.TWITTER_ACCOUNT_ID}/timelines/reverse_chronological`
  const params: any = {
    'expansions': 'attachments.media_keys,author_id,entities.mentions.username,referenced_tweets.id,referenced_tweets.id.author_id',
    'media.fields': 'url,public_metrics,alt_text',
    'tweet.fields': 'conversation_id,created_at,entities,public_metrics,reply_settings',
    'user.fields': 'protected,public_metrics,verified',
    'max_results': '10',
    ...(token && {
      'pagination_token': token
    })
  }
  const authorizationString = createOAuthString("GET", baseUrl, params)
   
  const paramsArray: Array<string> = []
  Object.keys(params).forEach((key) => {
    paramsArray.push(`${key}=${params[key]}`)
  })
  const url = `${baseUrl}?${paramsArray.join('&')}`

  const response = await fetch(
    url, {
      headers: new Headers({
        'Authorization': authorizationString
      })
    }
  )
  const json = await response.json()
  const nextToken = json.meta.next_token

  // parse the tweets
  const tweetsArray = json.data
  const tweets: Tweet[] = []

  tweetsArray.forEach((twitterTweet: TwitterTweet) => {
    // get the corresponding user object for the tweet's author
    const userObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === twitterTweet.author_id
    )

    // there should only be one referenced tweet - the quoted tweet - as we are excluding replies/retweets
    const quotedTweetId = twitterTweet.referenced_tweets?.[0]?.id
    const quotedTweetObject: TwitterTweet = json.includes?.tweets?.find(
      (tweet: TwitterTweet) => tweet.id === quotedTweetId
    )
    const quotedTweetUserObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === quotedTweetObject?.author_id
    )

    // check for URLs in the quotes tweet
    const quotedUrlArray = quotedTweetObject?.entities?.urls?.map((url) => (
      {
        url: url.url,
        expanded_url: url.expanded_url,
        display_url: url.display_url
      }
    ))

    // remove the referenced tweet link from the text of the original tweet - it will always be the last link
    if (quotedTweetId) {
      twitterTweet.text = twitterTweet.text.replace(/\s?https:\/\/t\.co\/\w+$/, "");
    }

    // get URLs from tweet
    const urlArray = twitterTweet.entities?.urls?.map((url) => (
      {
        url: url.url,
        expanded_url: url.expanded_url,
        display_url: url.display_url
      }
    ))

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
      },
      ...(quotedTweetId && {
        quoted_tweet: {
          id: quotedTweetObject.id,
          created_at: quotedTweetObject.created_at,
          text: quotedTweetObject.text,
          conversation_id: quotedTweetObject.conversation_id,
          reply_setting: quotedTweetObject.reply_settings,
          metrics: {
            retweet_count: quotedTweetObject.public_metrics.retweet_count,
            quote_count: quotedTweetObject.public_metrics.quote_count,
            like_count: quotedTweetObject.public_metrics.like_count,
            reply_count: quotedTweetObject.public_metrics.reply_count,
          },
          author: {
            id: quotedTweetUserObject.id,
            username: quotedTweetUserObject.username,
            name: quotedTweetUserObject.name,
            verified: quotedTweetUserObject.verified,
            protected: quotedTweetUserObject.protected,
            metrics: {
              followers_count: quotedTweetUserObject.public_metrics.followers_count,
              following_count: quotedTweetUserObject.public_metrics.following_count,
              tweet_count: quotedTweetUserObject.public_metrics.tweet_count,
            }
          },
          ...(quotedUrlArray?.length && {
            urls: quotedUrlArray
          })
        }
      }),
      ...(urlArray && {
        urls: urlArray
      })
    }

    tweets.push(tweet)
  })

  // res.status(200).json({ tweets: json }) 
  res.status(200).json({ tweets: tweets, next_token: nextToken }) 
}
