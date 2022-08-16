import type { NextApiRequest, NextApiResponse } from 'next'

const US_WOED = 23424977;

interface Trend {
  name: string;
  url: string;
  query: string;
  promoted_content?: string;
  tweet_volume: number;
}

type Data = {
  trends: Trend[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await fetch(
    `https://api.twitter.com/1.1/trends/place.json?id=${US_WOED}&exclude=hashtags`, {
      headers: new Headers({
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      })
    }
  )
  const json = await response.json()
  const allTrends = json[0].trends
  const filteredTrends = allTrends.map((trend: Trend) => (
    {
      name: trend.name,
      url: trend.url,
      query: trend.query,
      tweet_volume: trend.tweet_volume
    }
  )).sort((a: Trend, b: Trend) => b.tweet_volume - a.tweet_volume)

  res.status(200).json({ trends: filteredTrends })
}
