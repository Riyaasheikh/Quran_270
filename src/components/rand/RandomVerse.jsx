import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiRefreshLine, RiLoader4Line, RiArrowRightLine } from '@remixicon/react';
// Ensure both functions are imported here
import { fetchSpecificVerse, fetchChapterDetail } from '../../api/quranApi'; 
import SectionWrapper from '../../ui/SectionWrapper';

const RandomVerse = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRandomVerse = async () => {
    setLoading(true);
    try {
      // 1. Pick a random Surah (1 to 114)
      const randomSurahId = Math.floor(Math.random() * 114) + 1;
      
      // 2. Fetch Surah details to get the correct verse count
      const chapter = await fetchChapterDetail(randomSurahId);
      const totalVerses = chapter.verses_count;
      
      // 3. Pick a random verse number within that Surah
      const randomVerseNumber = Math.floor(Math.random() * totalVerses) + 1;
      const verseKey = `${randomSurahId}:${randomVerseNumber}`;
      
      // 4. Fetch the specific verse using the formatted key (e.g., "18:10")
      const data = await fetchSpecificVerse(verseKey);
      setVerse(data);
    } catch (err) {
      console.error("Failed to fetch random verse:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRandomVerse();
  }, []);

  if (loading) return (
    <div className="bg-white p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3">
      <RiLoader4Line className="animate-spin text-[#C0E2CA]" size={32} />
      <p className="text-sm text-gray-400 font-medium animate-pulse">Selecting a verse...</p>
    </div>
  );

  // Split verse key for the Link (e.g., "18:10" -> ["18", "10"])
  const [sId, vNum] = verse?.verse_key?.split(':') || [];

  return (
    <SectionWrapper>

    
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-500">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bfa07d] bg-[#C0E2CA] px-4 py-1.5 rounded-full">
            Verse of the Moment
          </span>
          <button 
            onClick={getRandomVerse}
            className="p-2 text-gray-300 hover:text-[#C0E2CA] hover:bg-gray-50 rounded-full transition-all duration-300"
          >
            <RiRefreshLine size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Arabic Text */}
          <p className="text-right font-serif text-3xl md:text-4xl leading-[2.2] text-gray-900 rtl">
            {verse?.text_uthmani}
          </p>
          
          {/* Translation */}
          <div className="relative pl-6 border-l-2 border-[#C0E2CA]/20">
            <p className="text-gray-600 text-base md:text-lg leading-relaxed italic">
              <span dangerouslySetInnerHTML={{ __html: verse?.translations?.[0]?.text }} />
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference</span>
            <span className="text-sm font-black text-gray-900">{verse?.verse_key}</span>
          </div>
          
          <Link 
            to={`/surah/${sId}/${vNum}`}
            className="flex items-center gap-2 px-5 py-2 bg-[#C0E2CA] text-[#bfa07d] text-sm font-bold rounded-xl  hover:gap-3 transition-all shadow-lg shadow-[#C0E2CA]/20"
          >
            Go to Verse <RiArrowRightLine size={18} />
          </Link>
        </div>
      </div>
    </div>
    </SectionWrapper>
  );
};

export default RandomVerse;