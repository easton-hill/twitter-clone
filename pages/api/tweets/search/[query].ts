import type { NextApiRequest, NextApiResponse } from 'next'
import { Tweet, parseTweets } from 'utils'

type Data = {
  tweets: Tweet[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // get the string to search for from the request
  const { query } = req.query

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
  const tweets: Tweet[] = parseTweets(json)

  // res.status(200).json({ tweets: json }) 
  res.status(200).json({ tweets: tweets }) 
}
