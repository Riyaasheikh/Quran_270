import React from "react";
import {
  RiBookmarkLine,
  RiBookmarkFill,
  RiArrowRightLine,
  RiShareLine,
} from "@remixicon/react";

const HadithCard = ({ hadith, onSelect, isBookmarked, onToggleBookmark }) => {
  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `${hadith.reference}\n\n"${hadith.english}"\n\nRead more on Deen 360`;
    if (navigator.share) {
      navigator.share({ title: hadith.reference, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Hadith reference copied to clipboard!");
    }
  };

  return (
    <article
      onClick={() => onSelect(hadith)}
      className="theme-card theme-card-lift p-6 rounded-2xl flex flex-col justify-between gap-5 group cursor-pointer transition-all border border-theme"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-theme/60 pb-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider theme-gold">
              {hadith.collectionName}
            </span>
            <span className="w-1 h-1 rounded-full bg-theme-strong" />
            <span className="text-[10px] font-mono theme-subtle">
              #{hadith.hadithNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`theme-icon-button theme-icon-button-sm cursor-pointer ${
                isBookmarked ? "text-accent border-accent" : ""
              }`}
              title={isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
            >
              {isBookmarked ? (
                <RiBookmarkFill size={16} className="text-accent" />
              ) : (
                <RiBookmarkLine size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="theme-icon-button theme-icon-button-sm cursor-pointer"
              title="Share Hadith"
            >
              <RiShareLine size={16} />
            </button>
          </div>
        </div>

        {/* Arabic Matn */}
        {hadith.arabic && (
          <p
            className="font-quran text-xl sm:text-2xl text-right leading-loose theme-text mb-4 line-clamp-3"
            dir="rtl"
          >
            {hadith.arabic}
          </p>
        )}

        {/* English Translation */}
        <p className="text-sm theme-secondary leading-relaxed line-clamp-3 font-serif mb-3">
          "{hadith.english}"
        </p>

        {/* Urdu Translation Excerpt */}
        {hadith.urdu && (
          <p
            className="text-xs sm:text-sm theme-muted leading-relaxed line-clamp-2 text-right"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2.1" }}
            dir="rtl"
          >
            {hadith.urdu}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-theme/50 flex items-center justify-between text-xs">
        <span className="theme-muted font-medium truncate max-w-[220px]">
          {hadith.reference}
        </span>

        <span className="theme-accent font-semibold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
          <span>Read Full Text</span>
          <RiArrowRightLine size={14} className="rtl:rotate-180" />
        </span>
      </div>
    </article>
  );
};

export default HadithCard;