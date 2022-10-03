import type { NextApiRequest, NextApiResponse} from 'next'
import { Profile, Tweet, TwitterProfile, TwitterTweet, TwitterUser, createOAuthString } from 'utils'

type Data = {
  profile: Profile
  tweets: Array<Tweet>;
  next_token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, token } = req.query
  const profileBaseUrl = `https://api.twitter.com/2/users/${id}`

  const profileParams: any = {
    'expansions': 'pinned_tweet_id',
    'tweet.fields': 'conversation_id,created_at,entities,public_metrics,reply_settings',
    'user.fields': 'created_at,description,entities,location,protected,public_metrics,url,verified',
  }
  const profileAuthorizationString = createOAuthString('GET', profileBaseUrl, profileParams)
  const profileParamsArray: Array<string> = []
  Object.keys(profileParams).forEach((key) => {
    profileParamsArray.push(`${key}=${profileParams[key]}`)
  })
  const profileUrl = `${profileBaseUrl}?${profileParamsArray.join('&')}`

  const tweetsBaseUrl = `https://api.twitter.com/2/users/${id}/tweets`
  const tweetsParams: any = {
    'expansions': 'attachments.media_keys,author_id,entities.mentions.username,referenced_tweets.id,referenced_tweets.id.author_id',
    'tweet.fields': 'conversation_id,created_at,entities,public_metrics,reply_settings',
    'user.fields': 'created_at,description,entities,location,protected,public_metrics,url,verified',
    ...(token && {
      'pagination_token': token
    })
  }
  const tweetsAuthorizationString = createOAuthString('GET', tweetsBaseUrl, tweetsParams)
  const tweetsParamsArray: Array<string> = []
  Object.keys(tweetsParams).forEach((key) => {
    tweetsParamsArray.push(`${key}=${tweetsParams[key]}`)
  })
  const tweetsUrl = `${tweetsBaseUrl}?${tweetsParamsArray.join('&')}`

  const [profileResponse, tweetsResponse] = await Promise.all([
    fetch(
      profileUrl, {
        headers: new Headers({
          'Authorization': profileAuthorizationString
        })
      }
    ),
    fetch(
      tweetsUrl, {
        headers: new Headers({
          'Authorization': tweetsAuthorizationString
        })
    })
  ])

  const profileJson = await profileResponse.json()
  const tweetsJson = await tweetsResponse.json()

  // parse the profile
  const twitterProfile: TwitterProfile = profileJson.data

  // check for pinned tweet
  const pinnedTweet = profileJson.includes?.tweets?.[0]

  const profile: Profile = {
    id: twitterProfile.id,
    username: twitterProfile.username,
    name: twitterProfile.name,
    verified: twitterProfile.verified,
    protected: twitterProfile.protected,
    metrics: {
      followers_count: twitterProfile.public_metrics.followers_count,
      following_count: twitterProfile.public_metrics.following_count,
      tweet_count: twitterProfile.public_metrics.tweet_count
    },
    bio: {
      description: twitterProfile.description,
      created_at: twitterProfile.created_at,
      ...(twitterProfile.location && {location: twitterProfile.location}),
      ...(twitterProfile.entities?.url && {
        url: {
          display_url: twitterProfile.entities?.url?.urls[0].display_url,
          expanded_url: twitterProfile.entities?.url?.urls[0].expanded_url
        }
      })
    },
    ...(pinnedTweet && {
      pinned_tweet: {
        id: pinnedTweet.id,
        created_at: pinnedTweet.created_at,
        text: pinnedTweet.text,
        conversation_id: pinnedTweet.conversation_id,
        reply_setting: pinnedTweet.reply_settings,
        metrics: {
          retweet_count: pinnedTweet.public_metrics.retweet_count,
          quote_count: pinnedTweet.public_metrics.quote_count,
          like_count: pinnedTweet.public_metrics.like_count,
          reply_count: pinnedTweet.public_metrics.reply_count
        },
        author: {
          id: twitterProfile.id,
          username: twitterProfile.username,
          name: twitterProfile.name,
          verified: twitterProfile.verified,
          protected: twitterProfile.protected,
          metrics: {
            followers_count: twitterProfile.public_metrics.followers_count,
            following_count: twitterProfile.public_metrics.following_count,
            tweet_count: twitterProfile.public_metrics.tweet_count
          }
        },
      }
    })
  }

  // parse the tweets
  const nextToken = tweetsJson.meta.next_token
  const tweetsArray = tweetsJson.data
  const tweets: Tweet[] = []

  tweetsArray.forEach((twitterTweet: TwitterTweet) => {
    // get the corresponding user object for the tweet's author
    const userObject: TwitterUser = tweetsJson.includes.users.find(
      (user: TwitterUser) => user.id === twitterTweet.author_id
    )

    // there should only be one referenced tweet - the quoted tweet - as we are excluding replies/retweets
    const quotedTweetId = twitterTweet.referenced_tweets?.[0]?.id
    const quotedTweetObject: TwitterTweet = tweetsJson.includes?.tweets?.find(
      (tweet: TwitterTweet) => tweet.id === quotedTweetId
    )
    const quotedTweetUserObject: TwitterUser = tweetsJson.includes.users.find(
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

  res.status(200).json({ profile: profile, tweets: tweets, next_token: nextToken })
}