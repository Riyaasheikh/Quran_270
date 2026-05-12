import React from 'react';
import { RiCloseLine } from "@remixicon/react";

const LanguageModal = ({ isOpen, onClose, currentLang, onSelectLang }) => {
  if (!isOpen) return null;

  const languages = [
    { name: "English", native: "English" },
   
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-[320px] z-[120] bg-white flex flex-col shadow-2xl transition-transform transform translate-x-0">

        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Select Language</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RiCloseLine size={28} className="text-gray-900" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-1">
          {languages.map((lang) => {
            const isActive = currentLang === lang.native;
            return (
              <button
                key={lang.name}
                onClick={() => {
                  onSelectLang(lang.native);
                  onClose();
                }}
                className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "text-[#2ca4ab] font-bold" 
                    : "text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <span className={`text-lg ${isActive ? "text-[#2ca4ab]" : "text-gray-800"}`}>
                  {lang.native}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default LanguageModal;