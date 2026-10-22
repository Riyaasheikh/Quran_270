import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiTranslate2, 
  RiCheckLine, 
  RiCloseLine, 
  RiSearchLine 
} from '@remixicon/react';
import { LANGUAGES } from '../../i18n/config';

const LanguageSelector = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

  const currentLang = i18n.language || 'en';

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(filter.toLowerCase()) ||
    l.native.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[200]" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 ltr:right-0 rtl:left-0 w-full max-w-sm bg-theme-card border-x border-theme z-[210] shadow-2xl flex flex-col theme-transition">
        
        {/* Header */}
        <div className="p-5 border-b border-theme flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-soft flex items-center justify-center text-accent">
              <RiTranslate2 size={18} />
            </div>
            <h2 className="text-base font-bold theme-text">
              Select Language
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="theme-icon-button theme-icon-button-sm"
            aria-label="Close"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-theme">
          <div className="relative">
            <RiSearchLine size={16} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 theme-subtle" />
            <input
              type="text"
              placeholder="Search language..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="theme-input !py-1.5 ltr:pl-9 rtl:pr-9 text-xs !min-h-[2.2rem]"
            />
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto divide-y divide-theme/40 p-2">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLang.startsWith(lang.code);

            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left rtl:text-right transition-colors ${
                  isSelected 
                    ? 'bg-accent-soft text-accent font-bold' 
                    : 'theme-text hover:bg-theme-soft'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{lang.native}</span>
                  <span className="text-xs theme-subtle font-normal">{lang.name}</span>
                </div>
                
                {isSelected && (
                  <RiCheckLine size={18} className="text-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default LanguageSelector;