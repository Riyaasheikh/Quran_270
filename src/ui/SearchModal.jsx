import React from 'react';
import { 
  RiSearchLine, 
  RiMicLine, 
  RiCloseLine, 
  RiFundsLine, 
  RiBookLine,
  RiFileList3Line
} from "@remixicon/react";

const SearchModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const popularSearches = ["Al-Mulk", "Nuh", "Al-Kahf", "Ya-Sin"];
  const trySearching = ["Juz 1", "Page 1", "Ya-Sin", "36", "2:255"];

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Drawer Container - Fixed 320px Width */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[320px] z-[150] bg-white flex flex-col shadow-2xl transition-transform transform translate-x-0">
        
        {/* Top Search Bar - Integrated into Drawer Header */}
        <div className="border-b sticky top-0 bg-white z-10 p-4">
          <div className="flex items-center gap-3">
            <RiSearchLine className="text-gray-400 shrink-0" size={20} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search" 
              className="flex-grow text-lg outline-none placeholder:text-gray-400 min-w-0"
            />
            <div className="flex items-center gap-2 shrink-0">
              <RiMicLine className="cursor-pointer text-gray-500 hover:text-black transition-colors" size={20} />
              <button onClick={onClose}>
                <RiCloseLine className="cursor-pointer text-gray-500 hover:text-black transition-colors" size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Search Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-8">
          
          {/* Popular Searches Section */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
              Popular searches
            </h4>
            <div className="space-y-1">
              {popularSearches.map((item) => (
                <div key={item} className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                  <RiFundsLine className="text-gray-300 group-hover:text-[#2ca4ab]" size={18} />
                  <span className="text-[15px] text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Try Searching For Section */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
              Try searching for
            </h4>
            <div className="space-y-1">
              {trySearching.map((item) => (
                <div key={item} className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                  {item.includes(":") ? (
                    <RiFileList3Line className="text-gray-300 group-hover:text-[#2ca4ab]" size={18} />
                  ) : (
                    <RiBookLine className="text-gray-300 group-hover:text-[#2ca4ab]" size={18} />
                  )}
                  <span className="text-[15px] text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;