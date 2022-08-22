import type { NextApiRequest, NextApiResponse } from 'next'
import { Tweet, createOAuthString } from 'utils'

type Data = {
  tweets: Tweet[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const url = `https://api.twitter.com/2/users/${process.env.TWITTER_ACCOUNT_ID}/timelines/reverse_chronological`
  const authorizationString = createOAuthString("GET", url)

  const response = await fetch(
    url, {
      headers: new Headers({
        'Authorization': authorizationString
      })
    }
  )
  const json = await response.json()

  res.status(200).json({ tweets: json })
}
