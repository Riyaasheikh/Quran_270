import React from 'react'
import Navbar from '../components/global/Navbar'
import SearchSection from '../ui/SearchSection'
import QuranTab from '../ui/QuranTab'
import Footer from '../components/global/Footer'
import ContinueReading from '../ui/ContinueReading'
import QuranViewer from '../ui/QuranViewer'
import RandomVerse from '../components/rand/RandomVerse'


const HomePage = () => {
  return (
    <>
    <div className="min-h-screen w-full overflow-x-hidden">
    <Navbar/>
    <SearchSection/>
    <RandomVerse/>
    <ContinueReading/>
    <QuranViewer/>
    <QuranTab/>
    <Footer/>
    </div>
    </>
    )
}
export default HomePage