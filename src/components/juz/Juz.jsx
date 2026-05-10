import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowUpSLine, RiArrowDownSLine, RiBookOpenLine } from '@remixicon/react';
import { fetchChapters } from '../../api/quranApi';

const Juz = () => {
  const [chapters, setChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('ASCENDING');
  const navigate = useNavigate();

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      }
    };
    getChapters();
  }, []);

  // Professional mapping for quick reference in the UI
  const juzMapping = useMemo(() => ({
    1: "Al-Fatiha - Al-Baqarah", 2: "Al-Baqarah", 3: "Al-Baqarah - Al-Imran", 4: "Al-Imran - An-Nisa",
    5: "An-Nisa", 6: "An-Nisa - Al-Ma'idah", 7: "Al-Ma'idah - Al-An'am", 8: "Al-An'am - Al-A'raf",
    9: "Al-A'raf - Al-Anfal", 10: "Al-Anfal - At-Tawbah", 11: "At-Tawbah - Hud", 12: "Hud - Yusuf",
    13: "Yusuf - Ibrahim", 14: "Al-Hijr - An-Nahl", 15: "Al-Isra - Al-Kahf", 16: "Al-Kahf - Ta-Ha",
    17: "Al-Anbiya - Al-Hajj", 18: "Al-Mu'minun - Al-Furqan", 19: "Al-Furqan - An-Naml", 20: "An-Naml - Al-Ankabut",
    21: "Al-Ankabut - Al-Ahzab", 22: "Al-Ahzab - Ya-Sin", 23: "Ya-Sin - Az-Zumar", 24: "Az-Zumar - Fussilat",
    25: "Ash-Shura - Al-Jathiyah", 26: "Al-Ahqaf - Adh-Dhariyat", 27: "Adh-Dhariyat - Al-Hadid",
    28: "Al-Mujadila - At-Tahrim", 29: "Al-Mulk - Al-Mursalat", 30: "An-Naba - An-Nas"
  }), []);

  const juzArray = useMemo(() => {
    const base = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
    return sortOrder === 'ASCENDING' ? base : [...base].reverse();
  }, [sortOrder]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 bg-[#C0E2CA] min-h-screen font-sans">
      
      {/* Poster Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-[#8c7355] tracking-tighter uppercase mb-2">
          Juzz of the Quran
        </h1>
        

        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="h-[1px] w-12 bg-[#e8e1d5]"></div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e8e1d5] bg-white text-[10px] font-black text-[#8c7355] hover:bg-gray-50 transition-all tracking-widest uppercase"
          >
            {sortOrder} {sortOrder === 'ASCENDING' ? <RiArrowUpSLine size={14}/> : <RiArrowDownSLine size={14}/>}
          </button>
          <div className="h-[1px] w-12 bg-[#e8e1d5]"></div>
        </div>
      </div>

      {/* Grid for Juz 1-29 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
        {juzArray.filter(j => j.id !== 30).map((juz) => (
          <div 
            key={juz.id} 
            onClick={() => navigate(`/juz/${juz.id}`)}
            className="group relative flex flex-col items-center p-6 bg-white border-[1.5px] border-[#e8e1d5] rounded-xl shadow-[0_4px_0_0_#e8e1d5] hover:shadow-[0_8px_0_0_#8c7355] hover:border-[#8c7355] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Decorative Corner (Optional SVG or just styling) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#bfa07d]/20 rounded-tl-xl group-hover:border-[#8c7355]"></div>

            <span className="text-3xl font-black text-[#1f2124] mb-1 group-hover:text-[#8c7355] transition-colors">
              {juz.id}
            </span>
            
            <div className="w-6 h-[1.5px] bg-[#e8e1d5] mb-3 group-hover:w-12 group-hover:bg-[#8c7355] transition-all duration-500"></div>

            <h3 className="text-[11px] font-black text-[#8c7355] uppercase tracking-tighter text-center">
              Juz {juz.id}
            </h3>
            
            <p className="text-[9px] text-[#bfa07d] font-bold tracking-tight uppercase text-center mt-1 group-hover:text-gray-900">
              {juzMapping[juz.id]}
            </p>
          </div>
        ))}
      </div>

      {/* Special Hero Card for Juz 30 (Bottom Center) */}
      <div className="flex justify-center mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div 
          onClick={() => navigate(`/juz/30`)}
          className="w-full max-w-sm p-8 bg-white border-2 border-[#8c7355] rounded-2xl shadow-[0_15px_40px_rgba(140,115,85,0.15)] text-center cursor-pointer group hover:scale-105 transition-all"
        >
          <span className="text-5xl font-black text-[#1f2124] group-hover:text-[#8c7355]">30</span>
          <h2 className="text-xl font-black uppercase tracking-widest text-[#8c7355] mt-2 mb-4">Juz 'Amma</h2>
          <div className="h-[1px] w-full bg-[#e8e1d5] mb-4"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
            Surahs 78 to 114 <br />
            Includes An-Naba, An-Nazi'at, and Al-Mu'awwidhatayn
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[#8c7355] font-black text-xs uppercase tracking-tighter">
             <RiBookOpenLine size={16} /> Read Full Juz
          </div>
        </div>
      </div>

      {/* Decorative Footer */}
      
    </div>
  );
};

export default Juz;