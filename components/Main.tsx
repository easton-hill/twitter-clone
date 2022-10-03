import { useState, useEffect } from 'react'
import Timeline from './Timeline'
import Trending from './Trending'
import ProfileCard from './ProfileCard'
import { Profile, emptyProfile } from 'utils'

interface MainProps {
  activeTab: string;
}

export default function Main({ activeTab }: MainProps) {
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineToken, setTimelineToken] = useState('')
  const getTimeline = async () => {
    setTimelineLoading(true)
    const response = await fetch(`api/timeline?token=${timelineToken}`)
    const json = await response.json()
    setTimelineToken(json.next_token)
    setTimeline(timeline.concat(json.tweets))
    setTimelineLoading(false)
  }

  const [trending, setTrending] = useState([])
  const getTrending = async () => {
    const response = await fetch('api/trends')
    const json = await response.json()
    setTrending(json.trends)
  }

  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const getProfile = async () => {
    const response = await fetch('api/users/me')
    const json = await response.json()
    setProfile(json.me)
  }

  useEffect(() => {
    if (activeTab === 'timeline' && !timeline.length) {
      getTimeline()
    } else if (activeTab === 'trending' && !trending.length) {
      getTrending()
    } else if (activeTab === 'profile' && !profile.id) {
      getProfile()
    }
  }, [activeTab])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='mx-auto w-1/2 max-w-screen-sm border-x border-off-white bg-med-blue mt-20 mb-10'>
      {activeTab === 'timeline' && <Timeline tweets={timeline} getTweets={getTimeline} loading={timelineLoading} />}
      {activeTab === 'trending' && <Trending trends={trending} />}
      {activeTab === 'profile' && profile.id && <ProfileCard profile={profile} />}
      <button onClick={scrollToTop} className='fixed bottom-10 ml-[52%] xl:ml-[665px] text-4xl font-bold bg-off-white text-light-blue px-4 py-1 rounded-full'>
        {String.fromCharCode(8593)}
      </button>
    </div>
  )
}