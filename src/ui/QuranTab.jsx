import React, { useState } from 'react';
import SurahSection from '../components/surah/SurahSection';
import JuzSection from '../components/juz/Juz';
import RevelationSection from '../components/revelation/RevelationSection';
import SectionWrapper from '../ui/SectionWrapper';

const QuranTab = () => {
  const [activeTab, setActiveTab] = useState('Surah');

  const renderContent = () => {
    switch (activeTab) {
      case 'Surah':
        return <SurahSection />;
      case 'Juz':
        return <JuzSection />;
      case 'Revelation Order':
        return <RevelationSection />;
      default:
        return <SurahSection />;
    }
  };

  const tabs = ['Surah', 'Juz', 'Revelation Order'];

  return (
    <SectionWrapper>
      {/* Background set to Antique White */}
      <div className="w-full bg-[#fcfaf7] min-h-screen pt-8">
        <div className="max-w-[1400px] mx-auto px-6">
          
          {/* Tab Navigation Container */}
          <div className="flex items-center border-b border-[#e8e1d5] overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[16px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  activeTab === tab 
                    ? 'text-[#8c7355]' 
                    : 'text-[#bfa07d] hover:text-[#8c7355]'
                }`}
              >
                {tab}
                
                {/* Gold Animated Indicator */}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full flex justify-center">
                    <div className="w-full h-[2.5px] bg-[#8c7355] rounded-t-full shadow-[0_-2px_8px_rgba(140,115,85,0.3)]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default QuranTab;