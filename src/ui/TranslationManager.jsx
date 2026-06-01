import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiArrowLeftLine, RiSearchLine, RiInformationLine, RiCheckboxFill, RiCheckboxBlankLine } from '@remixicon/react';
import { fetchAvailableTranslations } from '../api/quranApi';

const TranslationManager = ({ isOpen, onClose, selectedId, onSelect }) => {
  const [translations, setTranslations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTranslations().then(setTranslations);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grouped = translations.reduce((acc, item) => {
    if (!acc[item.language_name]) acc[item.language_name] = [];
    acc[item.language_name].push(item);
    return acc;
  }, {});

  const filteredGroups = Object.keys(grouped).filter(lang => 
    lang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grouped[lang].some(t => t.author_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RiArrowLeftLine className="cursor-pointer" onClick={onClose} />
            <h2 className="text-xl font-bold">Translations</h2>
          </div>
          <RiCloseLine className="cursor-pointer" size={24} onClick={onClose} />
        </div>

        <div className="p-4">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search Translations"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#2ca4ab]/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {filteredGroups.map(lang => (
            <div key={lang} className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900 capitalize">{lang}</h3>
              <div className="space-y-4">
                {grouped[lang].map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() => onSelect(t)}
                  >
                    <div className="flex items-center gap-3">
                      {selectedId === t.id.toString() ? (
                        <RiCheckboxFill className="text-[#2ca4ab]" size={22} />
                      ) : (
                        <RiCheckboxBlankLine className="text-gray-200" size={22} />
                      )}
                      <span className={`text-[15px] ${selectedId === t.id.toString() ? 'font-bold' : 'text-gray-700'}`}>
                        {t.author_name}
                      </span>
                    </div>
                    <RiInformationLine className="text-gray-300 hover:text-gray-600" size={18} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationManager;