import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import login from '../pages/Login';
import ForgotPassword from "../pages/ForgotPassword";
import JuzDetail from "../components/juz/JuzDetail";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import SearchResults from "../pages/SearchResults";
import Bookmarks from "../pages/Bookmarks";
import SurahDetail from "../pages/SurahDetails";
import AboutUs from "../pages/AboutUs";
import Profile from "../pages/Profile";

export const router = createBrowserRouter([
  {
    path:'/',
      element:<HomePage/>

  },
  {
    path:'/:surahId',
    element:<SurahDetail/>

  },
  {
     path:"/surah/:surahId" ,
     element:<SurahDetail />
    },
  {

    path:'/:surahId/:verseNumber',
    element:<SurahDetail/>
  },
  {
// Adding /:verseNumber? makes the second part of the URL optional
  path: "/surah/:surahId/:verseNumber?", 
  element: <SurahDetail />
  },
  {
    path:"/bookmarks",
     element:<Bookmarks/>
  },
  {
    path:'/about',
    element:<AboutUs/>
  },

  {
    path:'/login',
    element:<Login/>

  },
  {
    path:'/profile',
    element:<Profile/>

  },
  {
    path:'/signup',
    element:<SignUp/>
  },

   {
    path:'/forgot-password',
    element:<ForgotPassword/>

  },
  {
 // In your router configuration file
  path: '/juz/:juzId',
  element: <JuzDetail />

},
 {
  path: '/search',
  element:<SearchResults/>
 },


 
  
]);