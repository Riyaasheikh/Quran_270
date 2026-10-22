import React from 'react';
import { RiPlayFill, RiArrowDownSLine } from '@remixicon/react';

const SurahControls = ({ onPlay, translation, onOpenTranslation }) => {
  return (
    <div className="max-w-5xl mx-auto pt-6 pb-2 px-6 flex items-center justify-center gap-3">
      <button
        onClick={onPlay}
        className="theme-button-outline !rounded-full !px-5 !py-2 text-xs font-bold gap-2 shadow-xs"
      >
        <RiPlayFill size={16} className="theme-accent" />
        <span>Listen</span>
      </button>

      <button
        onClick={onOpenTranslation}
        className="theme-button-outline !rounded-full !px-5 !py-2 text-xs font-bold gap-2 shadow-xs"
      >
        <span className="theme-muted">Translation:</span>
        <span className="theme-text">{translation.name}</span>
        <RiArrowDownSLine size={16} className="theme-subtle" />
      </button>
    </div>
  );
};

export default SurahControls;