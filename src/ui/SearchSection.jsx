import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import background from '../assets/background.jpeg';
import { fetchChapters } from '../api/quranApi';
import SearchBar from '../components/search/SearchBar';
import QuickActions from '../components/search/QuickActions';

const SearchSection = () => {
  const [allChapters, setAllChapters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters().then(setAllChapters);
  }, []);

  const handleSearch = (query) => {
    const found = allChapters.find(
      s => s.name_simple.toLowerCase() === query.toLowerCase() || s.id.toString() === query
    );
    
    if (found) {
      navigate(`/surah/${found.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full min-h-[320px] flex flex-col items-center justify-center px-4 py-16  bg-[#fcfaf7]  ">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fcfaf7]/10 via-[#fcfaf7]/60 to-[#C0E2CA]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <Link to="/" className="mb-10 hover:scale-105 transition-transform duration-500 text-center">
          <span className="text-5xl md:text-7xl font-black text-[#C0E2CA] tracking-tighter block leading-none">
            QURAN  <span className="text-5xl md:text-7xl font-black text-[#8c7355]">APP</span>
          </span>
        </Link>

        <SearchBar onSearch={handleSearch} />
        <QuickActions allChapters={allChapters} />
      </div>
    </div>
  );
};

export default SearchSection;