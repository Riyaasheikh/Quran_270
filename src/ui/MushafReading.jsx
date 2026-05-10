import React, { useState, useEffect } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine, RiLoader4Line, RiErrorWarningLine } from '@remixicon/react';

const MushafReading = ({ initialPage }) => {
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [imgLoading, setImgLoading] = useState(true);
  const [hasError, setHasError] = useState(false);


   const pageUrl = `https://static.quran.com/images/pages/mushaf/v2/${currentPage}.png`;

  useEffect(() => {
    setImgLoading(true);
    setHasError(false);
  }, [currentPage]);

  return (
    <div className="flex flex-col items-center bg-[#f4f1ea] min-h-screen py-10 selection:bg-transparent">
      
      {/* Book Container */}
      <div className="relative max-w-[800px] w-full bg-white shadow-2xl border-[12px] border-[#e8e2d2] rounded-sm overflow-hidden min-h-[800px] flex flex-col">
        
        <div className="flex-1 relative flex justify-center items-center p-4 md:p-8">
          {/* Loading Spinner */}
          {imgLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <RiLoader4Line size={40} className="animate-spin text-[#2ca4ab]" />
            </div>
          )}

          {/* Error Message */}
          {hasError && (
            <div className="flex flex-col items-center gap-2 text-red-400">
              <RiErrorWarningLine size={48} />
              <p className="font-bold text-sm">Failed to load page {currentPage}</p>
              <button 
                onClick={() => {setHasError(false); setImgLoading(true);}}
                className="mt-2 text-xs underline"
              >
                Retry
              </button>
            </div>
          )}

          <img 
            key={currentPage} 
            src={pageUrl} 
            alt={`Quran Page ${currentPage}`}
            className={`w-full h-auto transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setHasError(true);
              setImgLoading(false);
            }}
          />
        </div>

        {/* Page Footer */}
        <div className="text-center py-4 border-t border-gray-100 font-serif text-gray-400 bg-gray-50/50 uppercase tracking-[0.2em] text-[10px] font-black">
           Page {currentPage}
        </div>
      </div>

      {/* Fixed Navigation Controls */}
      <div className="fixed bottom-10 flex items-center gap-8 bg-white/95 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-gray-200 z-[100]">
        <button 
          onClick={() => setCurrentPage(p => Math.min(604, p + 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
        >
          <RiArrowLeftSLine size={32} />
        </button>
        
        <div className="text-center min-w-[60px]">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Mushaf</span>
          <span className="text-xl font-bold text-[#2ca4ab]">{currentPage}</span>
        </div>

        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
        >
          <RiArrowRightSLine size={32} />
        </button>
      </div>
    </div>
  );
};

export default MushafReading;