import { Profile, formatNumber } from 'utils'
import TweetCard from './TweetCard'

interface Props {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
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

  return (
    <div className='p-2'>
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
      <p className='pb-4'>
        {formatNumber(profile.metrics.following_count)} following | {" "}
        {formatNumber(profile.metrics.followers_count)} followers | {" "}
        {formatNumber(profile.metrics.tweet_count)} tweets
      </p>

      {profile.pinned_tweet && <TweetCard tweet={profile.pinned_tweet} />}
    </div>
  )
}