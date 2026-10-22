import React from 'react';
import Navbar from '../components/global/Navbar';
import SearchSection from '../ui/SearchSection';
import QuranTab from '../ui/QuranTab';
import Footer from '../components/global/Footer';
import ContinueReading from '../ui/ContinueReading';
import QuranViewer from '../ui/QuranViewer';
import RandomVerse from '../components/rand/RandomVerse';
import FastingHomeCard from '../components/prayerTime/FastingHomeCard'; // <-- Import here
import HadithOfTheDay from '../components/hadith/HadithOfTheDay';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden theme-page theme-transition">
      <Navbar />
      <SearchSection />
      
      {/* Verse of the Moment */}
      <RandomVerse />

      {/* Ramadan & Daily Fasting Linked to Prayer Times */}
      <FastingHomeCard />
      <HadithOfTheDay/>

      <ContinueReading />
      <QuranViewer />
      <QuranTab />
      <Footer />
    </div>
  );
};

export default HomePage;