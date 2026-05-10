import React from 'react';
import { RiCloseLine, RiExternalLinkLine, RiBookOpenLine } from '@remixicon/react';

const HadithDrawer = ({ verse, onClose }) => {
  if (!verse) return null;

  const searchUrl = `https://sunnah.com/search?q=${encodeURIComponent(
    verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '').slice(0, 60) || verse.verse_key
  )}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white z-[160] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hadith References</h2>
            <p className="text-sm text-[#2ca4ab] font-medium">Verse {verse.verse_key}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <RiCloseLine size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Arabic Verse */}
        <div className="px-6 py-4 bg-[#f9fafb] border-b border-gray-100">
          <p className="text-2xl leading-loose text-right font-serif text-gray-900 rtl">
            {verse.text_uthmani}
          </p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '')}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-5">
          <RiBookOpenLine size={48} className="text-[#2ca4ab] opacity-40" />

          <div>
            <p className="text-gray-700 font-semibold text-lg mb-1">
              Search Hadith for this verse
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Find hadith references related to this verse on Sunnah.com — the most comprehensive hadith database.
            </p>
          </div>

          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[#2ca4ab] text-white font-bold rounded-xl hover:bg-[#258d93] transition-colors"
          >
            <RiExternalLinkLine size={18} />
            Search on Sunnah.com
          </a>

          <p className="text-xs text-gray-300">Opens in a new tab</p>
        </div>
        </div>
     
    </>
  );
};

export default HadithDrawer;