import { useEffect, useState } from 'react'
import { Profile as ProfileType, emptyProfile, formatNumber, Tweet } from 'utils'
import TweetCard from './TweetCard'
import Timeline from './Timeline'

interface ProfileCardProps {
  profile: ProfileType;
  handleBackButtonClick: Function;
}

const ProfileCard = ({ profile, handleBackButtonClick }: ProfileCardProps) => {
  const getFormattedCreatedAt = (timestamp: string): string => {
    const createdAtDate = new Date(timestamp)
    const month = createdAtDate.getMonth()
    const year = createdAtDate.getFullYear()

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return `${monthNames[month]} ${year}`
  }

  const handleClick = () => {
    handleBackButtonClick()
  }

  return (
    <div>
      <div className='p-2 border-b border-off-white'>
        <button onClick={handleClick} className='text-4xl font-bold pb-4 pr-2'>
          {String.fromCharCode(8592)}
        </button>
        <h1 className='text-4xl'>{profile.name}</h1>
        <h2 className='text-2xl pb-2'>@{profile.username}</h2>
        <p className='text-xl pb-1'>{profile.bio.description}</p>
        <div className='flex items-center gap-2 pb-2'>
          <p>created: {getFormattedCreatedAt(profile.bio.created_at)}</p>
          {profile.bio.location && <p>location: {profile.bio.location}</p>}
          {
            profile.bio.url?.display_url &&
            <p>
              link: {" "}
              <a className="cursor-pointer underline hover:text-light-blue" href={profile.bio.url.expanded_url} target="_blank">
                {profile.bio.url.display_url}
              </a>
            </p>
          }
        </div>
        <p className='pb-2'>
          {formatNumber(profile.metrics.following_count)} following | {" "}
          {formatNumber(profile.metrics.followers_count)} followers | {" "}
          {formatNumber(profile.metrics.tweet_count)} tweets
        </p>
      </div>
        {profile.pinned_tweet && <TweetCard tweet={profile.pinned_tweet} isPinnedTweet={true} />}
    </div>
  )
}

interface ProfileProps {
  id: string;
  handleBackButtonClick: Function;
  handleProfileClick: Function;
}

export default function Profile({ id, handleBackButtonClick, handleProfileClick }: ProfileProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [tweetsLoading, setTweetsLoading] = useState(false)
  const [tweetsToken, setTweetsToken] = useState('')
  const getTweets = async () => {
    setTweetsLoading(true)
    const response = await fetch(`api/users/${id}?token=${tweetsToken}`)
    const json = await response.json()
    setTweetsToken(json.next_token)
    setTweets([...tweets, ...json.tweets])
    setTweetsLoading(false)
  }

  const [profile, setProfile] = useState<ProfileType>(emptyProfile)
  const getProfile = async () => {
    const response = await fetch(`api/users/${id}`)
    const json = await response.json()
    setProfile(json.profile)

    setTweetsLoading(true)
    setTweetsToken(json.next_token)
    setTweets(json.tweets)
    setTweetsLoading(false)
  }

  useEffect(() => {
    setTweets([])
    setTweetsToken('')
    getProfile()
  }, [id])

  return (
    <div>
      <ProfileCard profile={profile} handleBackButtonClick={handleBackButtonClick} />
      <Timeline tweets={tweets} getTweets={getTweets} loading={tweetsLoading} handleProfileClick={handleProfileClick} />
    </div>
  )
}