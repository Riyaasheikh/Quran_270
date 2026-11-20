import { createBrowserRouter, Outlet } from "react-router-dom";

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
import GuideChatWidget from "../components/global/GuideChatWidget";

// Global Layout Wrapper so GuideChatWidget works on all routes with useNavigate()
function AppLayout() {
  return (
    <>
      <Outlet />
      <GuideChatWidget />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/:surahId/:verseNumber?", element: <SurahDetail /> },
      { path: "/surah/:surahId/:verseNumber?", element: <SurahDetail /> },
      { path: "/juz/:juzId", element: <JuzDetail /> },
      { path: "/search", element: <SearchResults /> },
      { path: "/bookmarks", element: <Bookmarks /> },
      { path: "/quran", element: <QuranBookReader /> },
      { path: "/quran-explorer", element: <QuranExplorer /> },
      { path: "/prayer-times", element: <PrayerTimes /> },
      { path: "/hadith", element: <HadithPage /> },
      { path: "/fasting", element: <FastingHub /> },
      { path: "/supplications", element: <Supplications /> },
      { path: "/mosques", element: <MosqueFinder /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/zakat", element: <ZakatCalculator /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
]);