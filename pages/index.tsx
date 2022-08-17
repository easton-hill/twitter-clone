import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Trend } from '../utils'
import TrendCard from '../components/TrendCard'

const Home: NextPage = () => {
  const [trends, setTrends] = useState([]);

  const getTrends = async () => {
    console.log('fetching trends')
    const response = await fetch('/api/trends')
    const json = await response.json()
    setTrends(json.trends)
  }

  useEffect(() => {
    getTrends()
  }, []);

  return (
    <div>
      <Head>
        <title>Twitter Clone</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {trends.length > 0 && trends.map((trend: Trend) => (
        <TrendCard key={trend.name} trend={trend} />
      ))}
    </div>
  )
}

export default Home
