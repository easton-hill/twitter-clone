import TweetCard from './TweetCard'
import { Tweet } from 'utils'
import { useState, useEffect } from 'react'

interface TimelineProps {
  tweets: Array<Tweet>
  getTweets: Function;
  loading: boolean;
}

export default function Timeline({ tweets, getTweets, loading }: TimelineProps) {
  const [atBottom, setAtBottom] = useState(false)

  const handleScroll = () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
      setAtBottom(true)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (atBottom && !loading) {
      getTweets() 
    }
  }, [atBottom])

  useEffect(() => {
    if (!loading) {
      setAtBottom(false)
    }
  }, [loading])

  return (
    <div>
      {tweets.length > 0 && tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}