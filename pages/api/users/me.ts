import type { NextApiRequest, NextApiResponse} from 'next'
import { Profile, TwitterProfile, createOAuthString } from 'utils'

type Data = {
  me: Profile
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const baseUrl = 'https://api.twitter.com/2/users/me'
  const params: any = {
    'expansions': 'pinned_tweet_id',
    'tweet.fields': 'conversation_id,created_at,entities,public_metrics,reply_settings',
    'user.fields': 'created_at,description,entities,location,protected,public_metrics,url,verified',
  }
  const authorizationString = createOAuthString('GET', baseUrl, params)
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
  const twitterProfile: TwitterProfile = json.data

  // check for pinned tweet
  const pinnedTweet = json.includes?.tweets?.[0]

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

  res.status(200).json({ me: profile })
}