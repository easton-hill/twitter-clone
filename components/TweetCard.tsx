import { ReactElement } from 'react';
import { MouseEvent } from 'react'
import { Tweet, formatNumber, getElapsedTime } from '../utils'

interface Props {
  tweet: Tweet;
  isQuotedTweet?: boolean;
  handleProfileClick?: Function;
}

export default function TweetCard({ tweet, isQuotedTweet = false, handleProfileClick }: Props) {
  const hasQuotedTweet = tweet.quoted_tweet

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const profileId = e.currentTarget.dataset.profileId
    if (profileId && handleProfileClick) {
      handleProfileClick(profileId)
    }
  }

  const formatTweetText = (tweet: Tweet): ReactElement => {
    let cleanTweetText = tweet.text

    // decode HTML entities
    cleanTweetText = cleanTweetText.replace(/&amp;/g, '&')
    cleanTweetText = cleanTweetText.replace(/\n/g, '')

    // remove all links from tweet text
    tweet.urls?.forEach((url) => {
      cleanTweetText = cleanTweetText.replace(url.url, "")
    })

    if (cleanTweetText.slice(-1) !== " ") {
      cleanTweetText += " "
    }

    // split up the tweet based on mentions
    // each part will be an object with type, text, and profile ID (if applicable)
    const tweetParts = []
    let prevMentionEnd = 0
    tweet.mentions?.forEach(mention => {
      const prevText = cleanTweetText.substring(prevMentionEnd, mention.start)
      tweetParts.push({
        type: 'text',
        text: prevText,
        id: 0
      })

      const mentionText = cleanTweetText.substring(mention.start, mention.end)
      tweetParts.push({
        type: 'mention',
        text: mentionText,
        id: mention.id
      })

      prevMentionEnd = mention.end
    })
    const remainingText = cleanTweetText.substring(prevMentionEnd, cleanTweetText.length)
    tweetParts.push({
      type: 'text',
      text: remainingText,
      id: 0
    })

    // filter out any URLs that don't appear in actual tweet text (ex. quote RT links)
    const filteredURLs = tweet.urls?.filter((url) => tweet.text.includes(url.url))

    // format mentions, then add actual links to end of tweet
    return (
      <p className={`text-xl ${hasQuotedTweet ? 'mb-2' : ''}`}>
        {tweetParts?.map((tweetPart, i) => (
          <span key={i} data-profile-id={`${tweetPart.type === 'mention' ? tweetPart.id : '0'}`}
          className={`${tweetPart.type === 'mention' ? 'cursor-pointer text-light-blue hover:underline' : ''}`}
          onClick={handleClick}>
            {tweetPart.text}
          </span>
        ))}
        {filteredURLs?.map((url, i) => (
          <span key={i}>
            {i ? " " : ""}
            <a className="cursor-pointer text-light-blue hover:underline" href={url.expanded_url} target="_blank"> 
              {url.display_url}
            </a>
          </span>
        ))}
      </p>
    )
  }

  return (
    <div className={`border${isQuotedTweet ? ' rounded-md p-2' : '-b p-4'} border-off-white`}>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl'>{tweet.author.name}</h1>
        <a className='cursor-pointer underline hover:text-light-blue' href={`https://twitter.com/${tweet.author.username}/status/${tweet.id}`} target='blank'>
          View on twitter
        </a>
      </div>
      <h2 className='text-xl pb-2'>
        <span data-profile-id={tweet.author.id} onClick={handleClick} className="cursor-pointer text-light-blue hover:underline">
          @{tweet.author.username}</span> | {formatNumber(tweet.author.metrics.followers_count)} followers
      </h2>
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