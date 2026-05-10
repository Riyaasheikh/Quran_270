import React, { useEffect, useState, useContext } from 'react';
import { RiBookmarkFill, RiArrowRightSLine, RiLoader4Line, RiHistoryLine } from '@remixicon/react';
import SectionWrapper from './SectionWrapper';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

const ContinueReading = () => {
  const [lastRead, setLastRead] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    api.get('/api/last-read')
      .then(res => {
        // FIX: Check if the data has actual properties (like surah_id)
        if (res.data && res.data.surah_id) {
          setLastRead(res.data);
        } else {
          setLastRead(null);
        }
      })
      .catch(() => setLastRead(null))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SectionWrapper>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1f2124]">Continue Reading</h2>
          <Link
            to="/bookmarks"
            className="flex items-center gap-1 text-[#8c7355] font-semibold hover:opacity-60 transition-opacity"
          >
            <RiBookmarkFill size={18} />
            <span className="text-gray-800 border-b-2 border-[#8c7355]">My Quran</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RiLoader4Line size={28} className="text-[#8c7355] animate-spin" />
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <RiBookmarkFill size={36} className="text-[#8c7355] mx-auto mb-3 opacity-60" />
            <p className="text-gray-600 font-medium mb-4">Sign in to track your reading progress</p>
            <Link to="/login" className="inline-block px-6 py-2 bg-[#8c7355] text-white rounded-xl font-semibold hover:bg-[#8c7355] transition-colors">
              Sign In
            </Link>
          </div>
        ) : !lastRead ? (
          /* THIS BLOCK NOW WORKS CORRECTLY FOR NEW USERS */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <RiHistoryLine size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 max-w-xs mx-auto">Welcome! Start your journey by reading a Surah.</p>
            <Link
              to="/surah/1"
              className="mt-6 px-8 py-3 bg-[#8c7355] text-white rounded-2xl font-bold hover:bg-[#8c7355] transition-all shadow-lg shadow-teal-900/10"
            >
              Start with Al-Fatihah
            </Link>
          </div>
        ) : (
          /* UPDATED LINK FORMAT: Matches your /surah/:id/:verse pattern */
          <Link to={`/surah/${lastRead.surah_id}/${lastRead.verse_number}`}>
            <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#C0E2CA] transition-all cursor-pointer overflow-hidden">
              <div className="h-1.5 bg-[#C0E2CA] w-0 group-hover:w-full transition-all duration-500" />
              
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[white] flex items-center justify-center text-[#8c7355] font-black text-xl shrink-0 group-hover:bg-[#C0E2CA] group-hover:text-white transition-colors">
                    {lastRead.surah_id}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xl font-black text-gray-900">
                         {lastRead.surah_name}
                      </span>
                      {lastRead.surah_name_arabic && (
                        <span className="text-2xl text-gray-400 font-arabic leading-none">
                          {lastRead.surah_name_arabic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                      Last read: <span className="text-[#C0E2CA] group-hover:text-[#bfa07d] font-bold">Verse {lastRead.verse_number}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white text-[#8c7355] px-4 py-2 rounded-xl font-bold text-sm group-hover:bg-[#C0E2CA] group-hover:text-white transition-all">
                  <span>Continue</span>
                  <RiArrowRightSLine size={20} />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
};

export default ContinueReading;