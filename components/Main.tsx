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
  const getTimeline = async () => {
    const response = await fetch('api/timeline')
    const json = await response.json()
    setTimeline(json.tweets)
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

  return (
    <div className='mx-auto w-1/2 max-w-2xl border-x border-off-white bg-med-blue mt-20 mb-10'>
      {activeTab === 'timeline' && <Timeline tweets={timeline} />}
      {activeTab === 'trending' && <Trending trends={trending} />}
      {activeTab === 'profile' && profile.id && <ProfileCard profile={profile} />}
    </div>
  )
}