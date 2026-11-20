import React, { useState } from "react";
import { RiPlayFill, RiFileCopyLine, RiCheckLine, RiBook2Line, RiHistoryLine } from "@remixicon/react";
import BookmarkButton from "../../ui/BookmarkButton";
import { copyVerse } from "../../utils/copyVerse";
import TajweedText from "../tajweed/TajweedText";

const VerseCard = ({ verse, translationId, isBookmarked, onBookmarkToggle, onPlay, onTafsir, onHadith, tajweedEnabled }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyVerse(verse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="group theme-card p-6 md:p-8 transition-all duration-200">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-theme">
        <div className="flex items-center gap-4">
          <span className="ayah-number font-bold text-xs">{verse.verse_key}</span>
          <button onClick={() => onPlay(verse.verse_key)} className="theme-icon-button theme-icon-button-sm text-subtle hover:!text-accent" title="Play Ayah"><RiPlayFill size={18} /></button>
          <BookmarkButton verse={verse} translationId={translationId} initialIsBookmarked={isBookmarked} onToggle={onBookmarkToggle} />
        </div>
        <button onClick={handleCopy} className="theme-icon-button theme-icon-button-sm text-subtle hover:!text-accent" title="Copy Ayah">
          {copied ? <RiCheckLine size={18} className="text-[var(--success)]" /> : <RiFileCopyLine size={18} />}
        </button>
      </div>

      <div className="text-right my-6">
        <p className="font-quran leading-[2.4] select-text">
          <TajweedText text={verse.text_uthmani} enabled={tajweedEnabled} />
        </p>
      </div>

      <div className="text-left my-6">
        <p className="translation-text text-base md:text-lg leading-relaxed theme-secondary select-text">
          <span dangerouslySetInnerHTML={{ __html: verse.translations?.[0]?.text }} />
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-theme text-xs font-bold theme-muted">
        <button onClick={() => onTafsir(verse)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-theme-soft hover:theme-accent transition-colors"><RiBook2Line size={16} /><span>Tafsirs</span></button>
        <button onClick={() => onHadith(verse)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-theme-soft hover:theme-accent transition-colors"><RiHistoryLine size={16} /><span>Hadith</span></button>
      </div>
    </article>
  );
};
export default VerseCard;