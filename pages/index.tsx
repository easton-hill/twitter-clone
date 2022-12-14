import type { NextPage } from 'next'
import Head from 'next/head'
import App from 'components/App'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Twitter Clone</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <App />

    </div>
  )
}

export default Home
