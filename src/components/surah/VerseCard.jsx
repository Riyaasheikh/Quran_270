import React, { useState } from 'react';
import {
  RiPlayFill, RiFileCopyLine, RiCheckLine,
  RiEditLine, RiMoreFill, RiBook2Line,
  RiGraduationCapLine, RiChat3Line, RiLightbulbLine, RiHistoryLine
} from '@remixicon/react';
import BookmarkButton from '../../ui/BookmarkButton';
import { copyVerse } from '../../utils/copyVerse';

const VerseCard = ({ verse, translationId, isBookmarked, onBookmarkToggle, onPlay, onTafsir, onHadith }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyVerse(verse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group border-b border-gray-100/60 py-16 last:border-0">

      {/* Top action bar */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6 text-gray-400 font-medium">
          <span className="text-[15px] font-bold text-gray-500">{verse.verse_key}</span>

          <RiPlayFill
            className="cursor-pointer hover:text-[#2ca4ab] transition-colors"
            size={24}
            onClick={() => onPlay(verse.verse_key)}
          />

          <BookmarkButton
            verse={verse}
            translationId={translationId}
            initialIsBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
          />
        </div>

        <div className="flex items-center gap-6 text-gray-400 opacity-40 group-hover:opacity-100 transition-all">
          <button onClick={handleCopy}>
            {copied
              ? <RiCheckLine size={20} className="text-green-500" />
              : <RiFileCopyLine size={20} className="cursor-pointer hover:text-[#2ca4ab] transition-colors" />
            }
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <div className="text-right mb-12">
        <p className="text-4xl md:text-[44px] leading-[2.6] text-gray-900 font-serif rtl">
          {verse.text_uthmani}
        </p>
      </div>

      {/* Translation */}
      <div className="text-left mb-10 font-sans">
        <p className="text-[19px] md:text-[21px] text-[#1f2124] leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: verse.translations?.[0]?.text }} />
        </p>
      </div>

      {/* Bottom action buttons */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-bold text-gray-400">
        <button
          onClick={() => onTafsir(verse)}
          className="flex items-center gap-2 hover:text-[#2ca4ab] transition-colors"
        >
          <RiBook2Line size={18} /> Tafsirs
        </button>
        
<button
  onClick={() => onHadith(verse)}  
  className="flex items-center gap-2 hover:text-[#2ca4ab] transition-colors"
>
  <RiHistoryLine size={18} /> Hadith
</button>
      </div>
    </div>
  );h
};

export default VerseCard;