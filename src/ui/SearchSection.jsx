import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchChapters } from '../api/quranApi';
import SearchBar from '../components/search/SearchBar';
import QuickActions from '../components/search/QuickActions';

const SearchSection = () => {
  const [allChapters, setAllChapters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters().then(setAllChapters);
  }, []);

  // Fixed logic to handle Juz and generic searches
  const handleGlobalSearch = (query) => {
    const q = query.toLowerCase().trim();

    // 1. Handle Juz searches (e.g. "juz 30")
    if (q.includes('juz')) {
      const num = q.replace(/\D/g, '');
      if (num) return navigate(`/juz/${num}`);
    }

    // 2. Handle Surah searches
    const found = allChapters.find(s => 
      s.name_simple.toLowerCase().includes(q) || 
      s.id.toString() === q
    );
    
    if (found) {
      navigate(`/surah/${found.id}`);
    } else {
      // 3. Fallback to general search results page
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full min-h-[350px] flex flex-col items-center justify-center px-4 py-16 bg-[#fcfaf7] ">
      {/* Aesthetic Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fcfaf7]/80 to-[#fcfaf7]" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#C0E2CA]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#8c7355]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <Link to="/" className="mb-10 hover:scale-105 transition-all duration-500">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            <span className="text-[#C0E2CA]">QURAN</span>
            <span className="text-[#8c7355] ml-2">APP</span>
          </h1>
          
        </Link>

        {/* Passing the smart search handler */}
        <SearchBar allChapters={allChapters} />
        
        <QuickActions allChapters={allChapters} />
      </div>
    </div>
  );
};

export default SearchSection;