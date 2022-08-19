import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Trend } from 'utils'
import Trending from '../components/Trending'

const Home: NextPage = () => {
  const [trends, setTrends] = useState([]);

  const getTrends = async () => {
    console.log('fetching trends')
    const response = await fetch('/api/trends')
    const json = await response.json()
    setTrends(json.trends)
  }

  useEffect(() => {
    getTrends();
  }, []);

  return (
    <div>
      <Head>
        <title>Twitter Clone</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

        <div className='mx-auto my-8 w-2/4 max-w-2xl bg-med-blue'>
        {trends.length > 0 && <Trending trends={trends} />}
      </div>
    </div>
  )
}

export default Home
