import React from "react";
import Navbar from "../components/global/Navbar";
import SearchSection from "../ui/SearchSection";
import QuranTab from "../ui/QuranTab";
import Footer from "../components/global/Footer";
import ContinueReading from "../ui/ContinueReading";
import QuranViewer from "../ui/QuranViewer";
import RandomVerse from "../components/rand/RandomVerse";
import PrayerQuickCard from "../components/prayerTime/PrayerQuickCard";
import RamadanHomeCard from "../components/prayerTime/RamadanHomeCard";
import HadithOfTheDay from "../components/hadith/HadithOfTheDay";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden theme-page theme-transition">
      <Navbar />
      <SearchSection />

      {/* Verse of the Moment */}
      <RandomVerse />

      {/* Always-visible Prayer & Quick Action Tools Card */}
      <PrayerQuickCard />

      {/* Ramadan-only Card (Suhoor/Iftar, Duas, Fast Check-in & Fast Ledger) */}
      <RamadanHomeCard />

      <HadithOfTheDay />

      <ContinueReading />
      <QuranViewer />
      <QuranTab />
      <Footer />
    </div>
  );
};

export default HomePage;