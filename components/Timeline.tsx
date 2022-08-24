import { useState, useEffect } from 'react'
import TweetCard from './TweetCard'
import { Tweet } from 'utils'

export default function Timeline() {
  const [tweets, setTweets] = useState([])

  const getTweets = async () => {
    const response = await fetch('/api/timeline')
    const json = await response.json()
    setTweets(json.tweets)
  }

  useEffect(() => {
    getTweets()
  }, [])

  return (
    <div>
      {tweets.length > 0 && tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}