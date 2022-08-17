import { Tweet, formatNumber, getElapsedTime } from '../utils'

interface Props {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: Props) {
  return (
    <div className='border border-off-white p-4'>
      <h1 className='text-2xl'>{tweet.author.name}</h1>
      <h2 className='text-xl pb-2'>@{tweet.author.username} | {formatNumber(tweet.author.metrics.followers_count)} followers</h2>
      <h2>
        {getElapsedTime(tweet.created_at)} | {' '}
        {formatNumber(tweet.metrics.retweet_count)} RTs | {' '}
        {formatNumber(tweet.metrics.quote_count)} quotes | {' '}
        {formatNumber(tweet.metrics.like_count)} likes | {' '}
        {formatNumber(tweet.metrics.reply_count)} replies
      </h2>
      <p className='text-xl'>{tweet.text}</p>
    </div>
  )
}