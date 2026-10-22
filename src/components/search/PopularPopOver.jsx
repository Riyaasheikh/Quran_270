import React from 'react';
import { Link } from 'react-router-dom';
import { RiCloseLine, RiFireLine } from '@remixicon/react';

const PopularPopOver = ({ onClose }) => {
  const popularLinks = [
    { name: 'Surah Yaseen', path: '/36', desc: 'Heart of Quran' },
    { name: 'Surah Al-Mulk', path: '/67', desc: 'The Sovereignty' },
    { name: 'Surah Al-Kahf', path: '/18', desc: 'The Cave' },
    { name: 'Surah Ar-Rahman', path: '/55', desc: 'The Most Merciful' },
    { name: 'Surah Al-Waqi\'ah', path: '/56', desc: 'The Inevitable' },
  ];

  return (
    <div className="absolute top-full left-0 mt-3 w-[290px] bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl z-[150] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2 text-[#2ca4ab]">
          <RiFireLine size={18} />
          <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap">Quick Access</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <RiCloseLine size={20} />
        </button>
      </div>
      
      <div className="p-2 overflow-y-auto max-h-[400px] custom-scrollbar">
        {popularLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={onClose}
            className="flex flex-col px-4 py-3 hover:bg-teal-50/50 rounded-xl transition-all group border border-transparent hover:border-teal-100"
          >
            <span className="text-[15px] font-bold text-gray-800 group-hover:text-[#2ca4ab] transition-colors">
              {link.name}
            </span>
            <span className="text-xs text-gray-400 font-medium group-hover:text-gray-500">
              {link.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularPopOver;