import React from 'react';
import SectionWrapper from './SectionWrapper';
import { learningData } from '../data/learningData';

const StartLearning = () => {
  return (
    <SectionWrapper>
      <div className="w-full bg-white py-8 md:py-5  border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f2124]">
              Start Learning
            </h2>
            <button className="text-sm font-bold text-gray-500 underline underline-offset-4 hover:text-black transition-colors">
              See More
            </button>
          </div>

          {/* Scrollable Container */}
          {/* Add -mx-4 px-4 for mobile bleed and md:mx-0 md:px-0 to reset on desktop */}
{/* Scrollable Container */}
<div className="flex flex-nowrap overflow-x-auto hover-scrollbar gap-4 md:gap-6 -mx-4 px-4 md:mx-0 md:px-0 pb-4 transition-all">
  {learningData.map((item) => (
    <div 
      key={item.id} 
      className="flex-none w-[200px] md:w-[280px] aspect-square relative group cursor-pointer"
    >
      <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        <img 
          src={item.imgSrc} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {item.isNew && (
        <div className="absolute bottom-4 right-4 bg-[#b2ebf2] text-[#006064] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          New!
        </div>
      )}
    </div>
  ))}
</div>

        </div>
      </div>
    </SectionWrapper>
  );
};

export default StartLearning;