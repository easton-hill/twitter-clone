import type { NextApiRequest, NextApiResponse } from 'next'
import { Tweet, createOAuthString, parseTweets } from 'utils'

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
    'max_results': '50',
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
  const tweets: Tweet[] = parseTweets(json)

  // res.status(200).json({ tweets: json }) 
  res.status(200).json({ tweets: tweets, next_token: nextToken }) 
}
