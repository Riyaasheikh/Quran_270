import React, { useState } from "react";
import {
  RiCloseLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiShareLine,
  RiCheckLine,
  RiVolumeUpLine,
  RiStopCircleLine,
  RiShieldCheckLine,
} from "@remixicon/react";

const HadithDetailDrawer = ({ hadith, onClose, isBookmarked, onToggleBookmark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hadith) return null;

  // SpeechSynthesis for Arabic Matn
  const handlePlayArabic = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(hadith.arabic);
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleCopy = () => {
    const text = `${hadith.reference}\n\nArabic:\n${hadith.arabic}\n\nEnglish:\n"${hadith.english}"\n\nUrdu:\n${hadith.urdu}\n\nShared via Deen 360`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] transition-opacity"
        onClick={onClose}
      />

      {/* Slideover Drawer */}
      <aside className="fixed inset-y-0 ltr:right-0 rtl:left-0 w-full max-w-2xl bg-theme border-x border-theme z-[210] shadow-2xl flex flex-col theme-transition overflow-hidden">
        {/* Header */}
        <header className="p-5 border-b border-theme flex items-center justify-between bg-theme-overlay shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest theme-gold">
              {hadith.collectionName}
            </span>
            <h2 className="text-base font-extrabold theme-text">
              {hadith.reference}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(hadith)}
              className={`theme-icon-button theme-icon-button-sm transition-colors cursor-pointer ${
                isBookmarked ? "text-accent border-accent" : ""
              }`}
              title={isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
            >
              {isBookmarked ? (
                <RiBookmarkFill size={17} className="text-accent" />
              ) : (
                <RiBookmarkLine size={17} />
              )}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="theme-icon-button theme-icon-button-sm cursor-pointer"
              title="Copy"
            >
              {copied ? (
                <RiCheckLine size={17} className="text-[var(--success)]" />
              ) : (
                <RiShareLine size={17} />
              )}
            </button>

            <button
              onClick={onClose}
              className="theme-icon-button theme-icon-button-sm cursor-pointer"
              aria-label="Close"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {hadith.grades && hadith.grades.length > 0 && (
              <span className="theme-badge theme-badge-accent font-bold flex items-center gap-1.5 py-1 px-3">
                <RiShieldCheckLine size={14} />
                <span>{hadith.grades[0].grade}</span>
              </span>
            )}

            <span className="theme-badge bg-theme-soft theme-muted py-1 px-3">
              Hadith #{hadith.hadithNumber}
            </span>
          </div>

          {/* Arabic Text Presentation */}
          {hadith.arabic && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider theme-subtle">
                  Arabic Text (النص العربي)
                </span>

                <button
                  onClick={handlePlayArabic}
                  className="theme-button-outline !py-1 !px-3 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <RiStopCircleLine size={14} className="text-[var(--danger)]" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <RiVolumeUpLine size={14} className="theme-accent" />
                      <span>Recite Arabic</span>
                    </>
                  )}
                </button>
              </div>

              <p
                className="font-quran text-2xl sm:text-3xl text-right leading-loose theme-text p-4 rounded-2xl bg-theme-card border border-theme"
                dir="rtl"
              >
                {hadith.arabic}
              </p>
            </div>
          )}

          {/* English Translation */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider theme-subtle">
              English Translation
            </span>
            <p className="text-sm sm:text-base theme-secondary leading-relaxed font-serif p-4 rounded-2xl bg-theme-card border border-theme">
              "{hadith.english}"
            </p>
          </div>

          {/* Authentic Urdu Translation */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider theme-subtle">
              Urdu Translation (اردو ترجمہ)
            </span>
            <p
              className="text-base sm:text-lg theme-text leading-loose p-4 rounded-2xl bg-theme-card border border-theme text-right"
              style={{
                fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                lineHeight: "2.2",
              }}
              dir="rtl"
            >
              {hadith.urdu}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HadithDetailDrawer;