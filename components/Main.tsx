import { useState, useEffect } from 'react'
import Timeline from './Timeline'

export default function Main() {
  const [timeline, setTimeline] = useState([])

  const getTimeline = async () => {
    const response = await fetch('api/timeline')
    const json = await response.json()
    setTimeline(json.tweets)
  }

  useEffect(() => {
    getTimeline()
  }, [])

  return (
    <div className='mx-auto w-1/2 max-w-2xl border-x border-off-white bg-med-blue mt-20 mb-10'>
      <Timeline tweets={timeline} />
    </div>
  )
}