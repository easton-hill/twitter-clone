import TweetCard from './TweetCard'
import { Tweet } from 'utils'

interface TimelineProps {
  tweets: Array<Tweet>
}

export default function Timeline({ tweets }: TimelineProps) {
  return (
    <div>
      {tweets.length > 0 && tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}