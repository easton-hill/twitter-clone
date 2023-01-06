import { ReactElement, useState } from 'react';
import { Trend, Tweet, formatNumber } from '../utils'
import TweetCard from './TweetCard'

interface TrendCardProps {
  trend: Trend;
  handleProfileClick?: Function;
}

const TrendCard = ({ trend, handleProfileClick }: TrendCardProps): ReactElement => {
  const [trendingTweets, setTrendingTweets] = useState([])
  const [displayTrendingTweets, setDisplayTrendingTweets] = useState(false)

  const handleClick = async () => {
    if (!trendingTweets.length) {
      const response = await fetch(`/api/tweets/search/${trend.query}?ranked=true`)
      const json = await response.json();
      setTrendingTweets(json.tweets)
    }
    setDisplayTrendingTweets(!displayTrendingTweets)
  }

  return (
    <div className='border-b border-off-white p-4'>
      <h1 onClick={handleClick} className={`text-4xl cursor-pointer ${displayTrendingTweets && !trend.tweet_volume? 'mb-2': ''}`}>
        {trend.name}
      </h1>
      {trend.tweet_volume &&
        <h2 onClick={handleClick} className={`text-xl cursor-pointer ${ displayTrendingTweets ? 'mb-2': ''}`}>
          {formatNumber(trend.tweet_volume)} tweets
        </h2>}
      {displayTrendingTweets ? trendingTweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} handleProfileClick={handleProfileClick} />
      )) : undefined}
    </div>
  )
}

interface TrendingProps {
  trends: Array<Trend>;
  handleProfileClick?: Function;
}

export default function Trending({ trends, handleProfileClick }: TrendingProps) {
  return (
    <div>
      {trends.map((trend: Trend) => (
        <TrendCard key={trend.name} trend={trend} handleProfileClick={handleProfileClick} />
      ))}
    </div>
  )
}