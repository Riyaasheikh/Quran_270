import React, { useState } from 'react';
import { RiCloseLine, RiSearchLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';

const NavigationDrawer = ({ isOpen, onClose, allChapters }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = allChapters.filter(c => c.name_simple.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-start animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500">
        <div className="p-6 border-b flex items-center justify-between bg-[#2ca4ab] text-white">
          <h2 className="text-xl font-bold">Navigate Quran</h2>
          <RiCloseLine size={28} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="p-4">
          <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2">
            <RiSearchLine className="text-gray-400 mr-2" size={18} />
            <input 
              placeholder="Search Surah..." 
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-10 custom-scrollbar">
          {filtered.map(s => (
            <div 
              key={s.id} 
              onClick={() => { navigate(`/${s.id}`); onClose(); }}
              className="flex items-center gap-4 p-4 hover:bg-teal-50 rounded-xl cursor-pointer group transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-[11px] font-bold text-gray-400 group-hover:bg-[#2ca4ab] group-hover:text-white transition-colors">
                {s.id}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{s.name_simple}</span>
                <span className="text-xs text-gray-400">{s.translated_name.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;