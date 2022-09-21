import { MouseEvent } from 'react'

interface NavbarProps {
  activeTab: string;
  setActiveTab: Function;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    setActiveTab(e.currentTarget.id)
  }

  return (
    <div className='fixed top-0 w-full border-b border-off-white bg-med-blue text-4xl flex justify-around items-center h-20'>
      <h1 id='profile' className={`nav-link ${activeTab === 'profile' ? 'nav-link-active' : ''}`} onClick={handleClick}>Profile</h1>
      <h1 id='timeline' className={`nav-link ${activeTab === 'timeline' ? 'nav-link-active' : ''}`} onClick={handleClick}>Timeline</h1>
      <h1 id='trending' className={`nav-link ${activeTab === 'trending' ? 'nav-link-active' : ''}`} onClick={handleClick}>Trending</h1>
    </div>
  )
}