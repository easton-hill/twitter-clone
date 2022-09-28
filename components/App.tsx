import { useState } from 'react'
import Navbar from './Navbar'
import Main from './Main'

export default function App() {
  const [activeTab, setActiveTab] = useState('timeline')

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Main activeTab={activeTab} />
    </div>
  )
}