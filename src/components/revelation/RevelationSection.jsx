import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowUpSLine, RiArrowDownSLine, RiInformationLine } from '@remixicon/react';
import { fetchChapters } from '../../api/quranApi';

const RevelationSection = () => {
  const [chapters, setChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('ASCENDING');
  const navigate = useNavigate();

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getChapters();
  }, []);

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'ASCENDING' 
      ? a.revelation_order - b.revelation_order 
      : b.revelation_order - a.revelation_order;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12 bg-[#C0E2CA] min-h-screen font-sans">
      
      {/* Poster-Style Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute left-0 top-0 text-left hidden md:block">
            <span className="text-[10px] font-black text-[#bfa07d] uppercase tracking-widest block mb-1">Sort By:</span>
            <button 
                onClick={() => setSortOrder(prev => prev === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING')}
                className="flex items-center gap-1 px-5 py-2 border border-[#e8e1d5] rounded-full text-[10px] font-black text-[#8c7355] uppercase hover:bg-white transition-all"
            >
                {sortOrder === 'ASCENDING' ? 'ASC ↑' : 'DESC ↓'}
            </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-[#8c7355] tracking-tighter uppercase mb-2">
            Chronological <span className="font-serif italic font-light lowercase">revelation</span> order
        </h1>
        <p className="text-[10px] font-bold text-[#bfa07d] tracking-[0.3em] uppercase">
            based on tanzil.net scholarly opinion
        </p>
      </div>

      {/* High-Density Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mb-16">
        {sortedChapters.map((surah) => (
          <div 
            key={surah.id} 
            onClick={() => navigate(`/surah/${surah.id}`)}
            className="group relative flex flex-col items-center p-3 bg-white border-[1.5px] border-[#e8e1d5] rounded-lg shadow-sm hover:border-[#8c7355] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Revelation Order Badge */}
            <span className="text-[10px] font-black text-[#bfa07d] mb-1 group-hover:text-[#8c7355]">
              {surah.revelation_order}
            </span>

            {/* Simple Name */}
            <h3 className="text-[12px] font-black text-[#1f2124] tracking-tight uppercase text-center truncate w-full mb-1">
              {surah.name_simple}
            </h3>

            {/* Arabic Name (Small & Elegant) */}
            <div className="text-md font-serif text-[#8c7355]/60 mb-2 group-hover:text-[#8c7355] transition-colors">
              {surah.name_arabic}
            </div>

            {/* Place & ID */}
            <div className="mt-auto flex flex-col items-center">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                   ID: {surah.id}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-0.5 ${surah.revelation_place === 'makkah' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {surah.revelation_place}
                </span>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default RevelationSection;