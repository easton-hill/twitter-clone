import { ReactElement } from 'react';
import { MouseEvent } from 'react'
import { Tweet, formatNumber, getElapsedTime } from '../utils'

interface Props {
  tweet: Tweet;
  isQuotedTweet?: boolean;
  isPinnedTweet?: boolean;
  handleProfileClick?: Function;
}

export default function TweetCard({ tweet, isQuotedTweet = false, isPinnedTweet = false, handleProfileClick }: Props) {
  const hasQuotedTweet = tweet.referenced_tweet?.reference_type === 'quoted'
  const hasRetweetedTweet = tweet.referenced_tweet?.reference_type === 'retweeted'

  // if there is a retweet, the source tweet needs to be switched to the retweeted (referenced) tweet
  let sourceTweet: Tweet
  if (tweet.referenced_tweet?.reference_type === 'retweeted') {
    sourceTweet = tweet.referenced_tweet
  } else {
    sourceTweet = tweet
  }

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const profileId = e.currentTarget.dataset.profileId
    if (profileId && handleProfileClick) {
      handleProfileClick(profileId)
    }
  }

  const decodeEntities = (text: string): string => {
    // decode HTML entities
    let decodedText = text
    decodedText = text.replace(/&amp;/g, '&')
    return decodedText
  }

  const formatTweetText = (): ReactElement => {
    let cleanTweetText = sourceTweet.text

    // remove all links from tweet text
    sourceTweet.urls?.forEach((url) => {
      cleanTweetText = cleanTweetText.replace(url.url, "")
    })

    if (cleanTweetText.slice(-1) !== " ") {
      cleanTweetText += " "
    }

    // split up the tweet based on mentions
    // each part will be an object with type, text, and profile ID (if applicable)
    const tweetParts = []
    let prevMentionEnd = 0

    // since emojis count as two chars, we need to keep track of them and adjust the indices
    let emojiCount = 0

    sourceTweet.mentions?.forEach(mention => {
      let prevText = cleanTweetText.substring(prevMentionEnd + emojiCount, mention.start + emojiCount)
      const prevTextEmojiCount = (prevText.match(/\p{Emoji_Presentation}/ug) || []).length

      // if we found an emoji, we need to adjust the previous text for it
      if (prevTextEmojiCount) {
        prevText = cleanTweetText.substring(prevMentionEnd + emojiCount, mention.start + emojiCount + prevTextEmojiCount)
      }

      tweetParts.push({
        type: 'text',
        text: prevText,
        id: 0
      })

      emojiCount += prevTextEmojiCount

      const mentionText = cleanTweetText.substring(mention.start + emojiCount, mention.end + emojiCount)
      tweetParts.push({
        type: 'mention',
        text: mentionText,
        id: mention.id
      })

      prevMentionEnd = mention.end + emojiCount
    })
    const remainingText = cleanTweetText.substring(prevMentionEnd + emojiCount)
    tweetParts.push({
      type: 'text',
      text: remainingText,
      id: 0
    })

    // filter out any URLs that don't appear in actual tweet text (ex. quote RT links)
    const filteredURLs = sourceTweet.urls?.filter((url) => tweet.text.includes(url.url))

    // format mentions, then add actual links to end of tweet
    return (
      <p className={`whitespace-pre-line text-xl ${hasQuotedTweet ? 'mb-2' : ''}`}>
        {tweetParts?.map((tweetPart, i) => (
          <span key={i} data-profile-id={`${tweetPart.type === 'mention' ? tweetPart.id : '0'}`}
          className={`${tweetPart.type === 'mention' ? 'cursor-pointer text-light-blue hover:underline' : ''}`}
          onClick={handleClick}>
            {decodeEntities(tweetPart.text)}
          </span>
        ))}
        {filteredURLs?.map((url, i) => (
          <span key={i}>
            {i ? " " : "\n"}
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
      {hasRetweetedTweet && <p className='pb-1'>retweeted by {tweet.author.name}</p>}
      {isPinnedTweet && <p className='pb-1'>Pinned Tweet</p>}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl'>{sourceTweet.author.name}</h1>
        <a className='cursor-pointer underline hover:text-light-blue' href={`https://twitter.com/${sourceTweet.author.username}/status/${tweet.id}`} target='blank'>
          View on twitter
        </a>
      </div>
      <h2 className='text-xl pb-2'>
        <span data-profile-id={sourceTweet.author.id} onClick={handleClick} className="cursor-pointer text-light-blue hover:underline">
          @{sourceTweet.author.username}</span> | {formatNumber(tweet.author.metrics.followers_count)} followers
      </h2>
      <h2>
        {getElapsedTime(sourceTweet.created_at)} | {' '}
        {formatNumber(sourceTweet.metrics.retweet_count)} RTs | {' '}
        {formatNumber(sourceTweet.metrics.quote_count)} quotes | {' '}
        {formatNumber(sourceTweet.metrics.like_count)} likes | {' '}
        {formatNumber(sourceTweet.metrics.reply_count)} replies
      </h2>
      {formatTweetText()}
      {hasQuotedTweet && <TweetCard tweet={sourceTweet.referenced_tweet!} isQuotedTweet={true} />}
    </div>
  )
}