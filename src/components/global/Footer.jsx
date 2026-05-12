import React, { useState } from 'react';
import { 
  RiGlobalLine, 
  RiSunLine, 
  RiArrowDownSLine,
  RiMoonLine,
  RiFireLine
} from '@remixicon/react';
import SectionWrapper from '../../ui/SectionWrapper';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [theme, setTheme] = useState('Light');
  const [lang, setLang] = useState('English');

  const popularLinks = [
    { name: 'Surah Yaseen', path: '/surah/36', desc: 'Heart of Quran' },
    { name: 'Surah Al-Mulk', path: '/surah/67', desc: 'The Sovereignty' },
    { name: 'Surah Al-Kahf', path: '/surah/18', desc: 'The Cave' },
    { name: 'Surah Ar-Rahman', path: '/surah/55', desc: 'The Most Merciful' },
    { name: 'Surah Al-Waqi\'ah', path: '/surah/56', desc: 'The Inevitable' },
    { name: 'Surah Al-Muzzammil', path: '/surah/73', desc: 'The Enwrapped One' },
  ];

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Bookmarks', path: '/bookmarks' },
  ];

  return (
    <SectionWrapper>
      <footer className="w-full pt-10 md:pt-16 pb-5 text-[#1f2124]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 px-4">
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <span className="text-2xl font-black text-[#C0E2CA] tracking-tighter uppercase">
                Quran App
              </span>
            </Link>
            
            <div className="space-y-4 max-w-md">
              <h3 className="text-lg font-bold text-gray-800">Read, Listen, Search, and Reflect</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                A trusted platform to read, search, and listen to the Quran.

                We provide translations, tafsir, and word-by-word tools for deeper study.
              </p>
              
              <p className="text-gray-400 leading-relaxed text-xs italic">
                As a Sadaqah Jariyah, this platform is dedicated to helping people connect deeply with the Quran.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#C0E2CA]">Navigate</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-[15px] font-medium text-gray-600 hover:text-[#bfa07d] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 text-[#C0E2CA]">
              <RiFireLine size={18} />
              <h4 className="text-sm font-black uppercase tracking-widest">Popular Links</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              {popularLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex flex-col px-4 py-3 hover:text-[#bfa07d] rounded-xl transition-all group border border-transparent hover:border-[#bfa07d]/50"
                >
                  <span className=" text-[15px] font-bold text-gray-800 group-hover:text-[#bfa07d] transition-colors">
                    {link.name}
                  </span>
                  <span className=" text-xs text-gray-400 font-medium group-hover:text-gray-500">
                    {link.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          </div>
    
        <div className="max-w-[1400px] mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'Light' ? 'Dark' : 'Light')} 
              className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all min-w-[120px]"
            >
              {theme === 'Light' ? <RiSunLine size={18} className="text-orange-400"/> : <RiMoonLine size={18} className="text-indigo-500"/>}
              <span>{theme} Mode</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
              <RiGlobalLine size={18} className="text-[#C0E2CA]"/>
              <span>{lang}</span>
              <RiArrowDownSLine size={16} className="text-gray-400"/>
            </button>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs font-medium text-gray-400">
              © 2026 <span className="text-[#C0E2CA] font-bold">Quran App</span>. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </SectionWrapper>
  );
};

export default Footer;