import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowDownSLine, RiCloseLine, RiSearchLine } from '@remixicon/react';

const SurahDropDown = ({ currentSurah, allChapters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSurahs = allChapters
    .sort((a, b) => a.revelation_order - b.revelation_order)
    .filter(s => s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors group"
      >
        <span className="font-bold text-lg text-gray-800">
          {currentSurah.id}. {currentSurah.name_simple}
        </span>
        <RiArrowDownSLine 
          size={20} 
          className={`text-gray-400 group-hover:text-gray-800 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-[100]">
          <div className="p-4 bg-gray-50/50 border-b border-gray-50 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-gray-400">
              <RiCloseLine size={20} />
            </button>
            <p className="text-[13px] text-gray-600">
              Note: you're navigating by the order of revelation.
            </p>
          </div>

          <div className="p-3 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <RiSearchLine size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Surah"
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {filteredSurahs.map((surah) => (
              <div 
                key={surah.id}
                onClick={() => {
                  navigate(`/${surah.id}`);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-4 px-5 py-3 hover:bg-teal-50/30 cursor-pointer ${surah.id === currentSurah.id ? 'bg-teal-50 border-l-4 border-[#2ca4ab]' : ''}`}
              >
                <span className="text-sm font-bold text-gray-400 w-4">{surah.revelation_order}</span>
                <span className="text-[15px] font-medium text-gray-800">{surah.name_simple}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahDropDown;