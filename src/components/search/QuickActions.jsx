import React, { useState } from 'react';
import { RiArrowRightUpBoxLine, RiListUnordered } from '@remixicon/react';
import PopularPopOver from './PopularPopOver';
import NavigationDrawer from './NavigationDrawer';

const QuickActions = ({ allChapters }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPopOpen, setIsPopOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-start w-full gap-3 mt-8 relative ">
      <button 
        onClick={() => setIsNavOpen(true)}
        className="flex items-center justify-center sm:justify-start gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-transparent hover:border-[#2ca4ab] hover:shadow-xl transition-all active:scale-95 group"
      >
        <RiListUnordered className="text-[#bfa07d] group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-slate-700">Navigate Quran</span>
      </button>

      <div className="relative">
        <button 
          onClick={() => setIsPopOpen(!isPopOpen)}
          className={`flex items-center justify-center sm:justify-start gap-3 px-6 py-3 rounded-2xl shadow-sm border transition-all active:scale-95 group w-full ${isPopOpen ? 'bg-[#bfa07d] text-white' : 'bg-white/90 backdrop-blur-md border-transparent hover:border-[#2ca4ab]'}`}
        >
          <RiArrowRightUpBoxLine className={isPopOpen ? 'text-white' : 'text-[#bfa07d]'} />
          <span className={`font-bold ${isPopOpen ? 'text-white' : 'text-slate-700'}`}>Popular</span>
        </button>

        {isPopOpen && (
          <div className="absolute top-full left-0 mt-3 w-full sm:w-[300px]">
             <PopularPopOver onClose={() => setIsPopOpen(false)} />
          </div>
        )}
      </div>

      <NavigationDrawer 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
        allChapters={allChapters} 
      />
    </div>
  );
};

export default QuickActions;