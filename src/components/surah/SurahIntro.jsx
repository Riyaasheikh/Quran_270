import React from 'react';
import { RiInformationLine, RiSparklingFill } from '@remixicon/react';

const SurahIntro = ({ chapter }) => {
  if (!chapter) return null;

  return (
    <header className="relative flex flex-col items-center pt-14 pb-10 px-4 text-center overflow-hidden">
      {/* Soft Ambient Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        {/* Revelation Place & Index Pill */}
        <div className="inline-flex items-center gap-2 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-4">
          <RiSparklingFill size={12} />
          <span>
            {chapter.revelation_place || 'Meccan'} • Surah {chapter.id}
          </span>
        </div>

        {/* Primary Title with Number & Arabic Script */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight theme-text">
            {chapter.name_simple}
          </h1>

          {chapter.name_arabic && (
            <span className="font-quran text-2xl md:text-3xl theme-gold px-1">
              {chapter.name_arabic}
            </span>
          )}

          <span className="theme-badge theme-badge-accent uppercase tracking-wider text-[10px] font-bold py-1 px-2.5">
            <RiInformationLine size={13} />
            <span>Info</span>
          </span>
        </div>

        {/* English Translated Meaning */}
        {chapter.translated_name?.name && (
          <p className="text-lg md:text-xl theme-muted mt-2 font-medium italic">
            "{chapter.translated_name.name}"
          </p>
        )}

        {/* Surah Quick Metrics */}
        <div className="flex items-center gap-4 mt-6 pt-5 border-t border-theme/60 text-xs font-semibold theme-subtle">
          <span>{chapter.verses_count} Verses</span>
          <span className="w-1 h-1 rounded-full bg-theme-strong inline-block" />
          <span>Order {chapter.revelation_order}</span>
        </div>
      </div>
    </header>
  );
};

export default SurahIntro;