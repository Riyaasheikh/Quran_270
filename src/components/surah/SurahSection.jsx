import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { RiArrowUpSLine, RiArrowDownSLine, RiExpandDiagonalLine } from '@remixicon/react';
import { fetchChapters } from '../../api/quranApi';

const SurahSection = () => {
  const [chapters, setChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('ASCENDING');
  const navigate = useNavigate(); 

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
      } catch (error) {
        console.error("Error fetching Surahs:", error);
      }
    };
    getChapters();
  }, []);

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'ASCENDING' ? a.id - b.id : b.id - a.id;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12 bg-[#C0E2CA] min-h-screen font-sans">
      
      {/* Header with Poster Vibe */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-[#8c7355] tracking-tighter uppercase mb-2">
          Surahs of the Quran
        </h1>
        <p className="text-[10px] font-bold text-[#bfa07d] tracking-[0.3em] uppercase">
          A Complete Compendium • Premium Edition
        </p>
        
        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="h-[1px] w-12 bg-[#2CA4AB]"></div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e8e1d5] bg-white text-[10px] font-black text-[#8c7355] hover:bg-[#fcfaf7] transition-all tracking-widest uppercase"
          >
            {sortOrder} {sortOrder === 'ASCENDING' ? <RiArrowUpSLine size={14}/> : <RiArrowDownSLine size={14}/>}
          </button>
          <div className="h-[1px] w-12 bg-[#2CA4AB]"></div>
        </div>
      </div>

      {/* 6-Column Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {sortedChapters.map((surah) => (
          <div 
            key={surah.id} 
             onClick={() => navigate(`/${surah.id}`)}
            className="group relative flex flex-col items-center p-5 bg-white border-[1.5px] border-[#e8e1d5] rounded-xl shadow-[0_4px_0_0_#e8e1d5] hover:shadow-[0_8px_0_0_#8c7355] hover:border-[#8c7355] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Surah Number - Subtle top center */}
            <span className="text-[10px] font-black text-[#bfa07d] mb-2">
              {surah.id}
            </span>

            {/* Arabic Name - Focal Point */}
            <div className="text-2xl md:text-3xl font-serif text-[#1f2124] mb-3 group-hover:text-[#8c7355] transition-colors h-12 flex items-center justify-center text-center">
              {surah.name_arabic}
            </div>

            {/* Divider Line */}
            <div className="w-8 h-[1px] bg-[#2CA4AB] group-hover:w-16 group-hover:bg-[#8c7355] transition-all duration-500 mb-3"></div>

            {/* Simple Name */}
            <h3 className="text-xs font-black text-[#1f2124] tracking-tight uppercase text-center truncate w-full">
              {surah.name_simple}
            </h3>

            {/* Translated Meaning */}
            <p className="text-[9px] text-[#bfa07d] font-bold tracking-tight uppercase text-center mt-1 group-hover:text-[#8c7355] transition-colors">
              {surah.translated_name.name}
            </p>

            {/* Hover Indicator Icon */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <RiExpandDiagonalLine size={12} className="text-[#8c7355]" />
            </div>
          </div>
        ))}
      </div>
      
     
    </div>
  );
};

export default SurahSection;