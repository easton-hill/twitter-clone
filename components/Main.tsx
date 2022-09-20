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
    <div className='mx-auto my-8 w-2/4 max-w-2xl bg-med-blue'>
      <Timeline tweets={timeline} />
    </div>
  )
}