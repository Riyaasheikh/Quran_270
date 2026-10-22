import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowDownSLine, RiCloseLine, RiSearchLine } from '@remixicon/react';

const SurahDropDown = ({ currentSurah, allChapters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSurahs = (allChapters || [])
    .slice()
    .sort((a, b) => a.id - b.id)
    .filter(s => s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-theme-soft transition-colors group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-base md:text-lg theme-text">
          {currentSurah.id}. {currentSurah.name_simple}
        </span>
        <RiArrowDownSLine 
          size={18} 
          className={`theme-subtle group-hover:theme-text transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[300px] sm:w-[340px] theme-card p-0 shadow-2xl overflow-hidden z-[100] border border-theme">
          <div className="p-3.5 bg-theme-soft border-b border-theme flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider theme-subtle">
              Surah Navigator
            </span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="theme-subtle hover:theme-text p-1"
            >
              <RiCloseLine size={18} />
            </button>
          </div>

          <div className="p-2.5 border-b border-theme bg-theme-card">
            <div className="relative">
              <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtle" />
              <input 
                type="text" 
                placeholder="Search Surah by name..."
                className="theme-input !py-1.5 pl-9 text-xs !min-h-[2.2rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-theme/40">
            {filteredSurahs.map((surah) => {
              const isSelected = surah.id === currentSurah.id;
              return (
                <div 
                  key={surah.id}
                  onClick={() => {
                    navigate(`/surah/${surah.id}`);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 hover:bg-accent-soft cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent-soft border-l-4 border-[var(--accent)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="ayah-number !w-6 !h-6 !min-w-6 text-[10px]">
                      {surah.id}
                    </span>
                    <span className={`text-sm ${isSelected ? 'font-bold theme-accent' : 'theme-text'}`}>
                      {surah.name_simple}
                    </span>
                  </div>
                  <span className="font-arabic text-base theme-muted">
                    {surah.name_arabic}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahDropDown;