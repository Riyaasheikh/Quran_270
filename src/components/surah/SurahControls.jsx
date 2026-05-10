import React from 'react';
import { RiPlayFill, RiArrowDownSLine } from '@remixicon/react';

const SurahControls = ({ onPlay, translation, onOpenTranslation }) => {
  return (
    <div className="max-w-5xl mx-auto pt-10 px-6 flex justify-center gap-3">
      <button
        onClick={onPlay}
        className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <RiPlayFill size={18} className="text-[#2ca4ab]" />
        Listen
      </button>

      <button
        onClick={onOpenTranslation}
        className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Translation: {translation.name}
        <RiArrowDownSLine size={16} className="text-gray-400" />
      </button>
    </div>
  );
};

export default SurahControls;