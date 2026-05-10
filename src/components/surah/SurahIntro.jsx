import React from 'react';

const SurahIntro = ({ chapter }) => {
  if (!chapter) return null;

  return (
    <div className="flex flex-col items-center pt-16 pb-12">
     
      <div className="text-center">
        <h2 className="text-[32px] font-bold flex items-center justify-center gap-3 text-gray-900">
          {chapter.id}. {chapter.name_simple}
          <span className="bg-[#2ca4ab] text-white text-[11px] px-2.5 py-0.5 rounded-full uppercase font-black">
            Info
          </span>
        </h2>
        <p className="text-2xl text-gray-500 mt-1 font-medium italic">
          {chapter.translated_name?.name}
        </p>
      </div>
    </div>
  );
};

export default SurahIntro;