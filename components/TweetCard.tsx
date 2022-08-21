import { ReactElement } from 'react';
import { Tweet, formatNumber, getElapsedTime } from '../utils'

interface Props {
  tweet: Tweet;
  isQuotedTweet?: boolean;
}

export default function TweetCard({ tweet, isQuotedTweet = false }: Props) {
  const hasQuotedTweet = tweet.quoted_tweet

  const formatTweetText = (tweet: Tweet): ReactElement => {
    // remove all links from tweet text
    let cleanTweetText = tweet.text
    tweet.urls?.forEach((url) => {
      cleanTweetText = cleanTweetText.replace(url.url, "")
    })

    if (cleanTweetText.slice(-1) !== " ") {
      cleanTweetText += " "
    }

    // filter out any URLs that don't appear in actual tweet text (ex. quote RT links)
    const filteredURLs = tweet.urls?.filter((url) => tweet.text.includes(url.url))

    // add actual links to end of tweet
    return (
      <p className={`text-xl ${hasQuotedTweet ? 'mb-2' : ''}`}>
        {cleanTweetText}
        {filteredURLs?.map((url, i) => (
          <span key={i}>
            {i ? " " : ""}
            <a className="cursor-pointer underline hover:text-light-blue" href={url.expanded_url} target="_blank"> 
              {url.display_url}
            </a>
          </span>
        ))}
      </p>
    )
  }

  return (
    <div className={`border border-off-white ${isQuotedTweet ? 'rounded-md p-2' : 'p-4'}`}>
      <h1 className='text-2xl'>{tweet.author.name}</h1>
      <h2 className='text-xl pb-2'>@{tweet.author.username} | {formatNumber(tweet.author.metrics.followers_count)} followers</h2>
      <h2>
        {getElapsedTime(tweet.created_at)} | {' '}
        {formatNumber(tweet.metrics.retweet_count)} RTs | {' '}
        {formatNumber(tweet.metrics.quote_count)} quotes | {' '}
        {formatNumber(tweet.metrics.like_count)} likes | {' '}
        {formatNumber(tweet.metrics.reply_count)} replies
      </h2>
      {formatTweetText(tweet)}
      {hasQuotedTweet && <TweetCard tweet={hasQuotedTweet} isQuotedTweet={true} />}
    </div>
  )
}