import React from 'react';
import { RiArrowRightSLine } from '@remixicon/react';
import SectionWrapper from './SectionWrapper';

const ExploreTopics = () => {
  const topics = [
    "What is Ramadan?",
    "About The Quran",
    "Verses about the Sunnah",
    
  ];

  return (
    <SectionWrapper>
      <div className="w-full bg-white py-8 md:py-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1f2124] mb-6 md:mb-10">
            Explore Topics
          </h2>
          
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar  gap-3 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {topics.map((topic, index) => (
              <button
                key={index}
                className="flex flex-none items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-white border border-transparent hover:border-gray-200 rounded-full transition-all group whitespace-nowrap"
              >
                <span className="text-[15px] md:text-[20px] font-medium text-gray-800 group-hover:text-gray-500">
                  {topic}
                </span>
                <RiArrowRightSLine 
                  size={20} 
                  className="text-gray-600 group-hover:translate-x-0.5 transition-transform" 
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ExploreTopics;