import { Trend, formatNumber } from '../utils'

interface Props {
  trend: Trend;
}

export default function TrendCard({ trend }: Props) {
  return (
    <div className='border border-off-white p-4'>
      <h1 className='text-4xl'>{trend.name}</h1>
      {trend.tweet_volume && <h2 className='text-xl'>{formatNumber(trend.tweet_volume)} tweets</h2>}
    </div>
  )
}