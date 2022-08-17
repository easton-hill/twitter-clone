import { Trend, formatNumber } from '../utils'

interface Props {
  trend: Trend;
}

export default function TrendCard({ trend }: Props) {
  return (
    <div className='border border-off-white'>
      <h1>{trend.name}</h1>
      {trend.tweet_volume && <h2>{formatNumber(trend.tweet_volume)} tweets</h2>}
    </div>
  )
}