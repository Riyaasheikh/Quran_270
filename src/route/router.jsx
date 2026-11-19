import { createBrowserRouter } from "react-router-dom";

// Pages
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import SearchResults from "../pages/SearchResults";
import Bookmarks from "../pages/Bookmarks";
import SurahDetail from "../pages/SurahDetails";
import AboutUs from "../pages/AboutUs";
import Profile from "../pages/Profile";
import Supplications from "../pages/Supplications";
import PrayerTimes from "../pages/PrayerTimes";
import FastingHub from "../pages/FastingHub";
import HadithPage from "../pages/HadithPage";

// Components
import JuzDetail from "../components/juz/JuzDetail";
import MosqueFinder from "../pages/MosqueFinder";
import QuranBookReader from "../pages/QuranBookReader";
import QuranExplorer from "../pages/QuranExplorer";
import ZakatCalculator from "../pages/ZakatCalculator";

export const router = createBrowserRouter([
  // Home
  {
    path: "/",
    element: <HomePage />,
  },

  // Quran Shorthand: e.g. /1 or /1/5
  {
    path: "/:surahId/:verseNumber?",
    element: <SurahDetail />,
  },

  // Quran Explicit: /surah/:surahId/:verseNumber?
  {
    path: "/surah/:surahId/:verseNumber?",
    element: <SurahDetail />,
  },

  // Juz
  {
    path: "/juz/:juzId",
    element: <JuzDetail />,
  },

  // Search
  {
    path: "/search",
    element: <SearchResults />,
  },

  // Bookmarks & Readers
  {
    path: "/bookmarks",
    element: <Bookmarks />,
  },
  {
    path: "/quran",
    element: <QuranBookReader />,
  },
  {
    path: "/quran-explorer", 
    element: <QuranExplorer />
  },

  // Prayer Times & Daily Practice
  {
    path: "/prayer-times",
    element: <PrayerTimes />,
  },
  {
    path: "/hadith",
    element: <HadithPage />,
  },
  {
    path: "/fasting",
    element: <FastingHub />,
  },
  {
    path: "/supplications",
    element: <Supplications />,
  },
  { 
    path: "/mosques", 
    element: <MosqueFinder /> 
  },

  // About
  {
    path: "/about",
    element: <AboutUs />,
  },

  // Authentication
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path:'/zakat',
    element:<ZakatCalculator/>
  },

  // Profile
  {
    path: "/profile",
    element: <Profile />,
  },
]);