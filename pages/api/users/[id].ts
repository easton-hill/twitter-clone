import type { NextApiRequest, NextApiResponse} from 'next'
import { Profile, Tweet, TwitterProfile, createOAuthString, parseTweets } from 'utils'

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
  const nextToken = tweetsJson.meta.next_token || ''
  const tweetsArray = tweetsJson.data

  if (!tweetsArray) {
    res.status(200).json({ profile: profile, tweets: [], next_token: nextToken })
    return
  } else {
    const tweets: Tweet[] = parseTweets(tweetsJson)
    res.status(200).json({ profile: profile, tweets: tweets, next_token: nextToken })
  }
}