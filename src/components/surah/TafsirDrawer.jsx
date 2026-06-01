import React, { useEffect, useState } from 'react';
import { RiCloseLine, RiLoader4Line, RiArrowDownSLine } from '@remixicon/react';
import { fetchTafsirForVerse, fetchAvailableTafsirs } from '../../api/quranApi';

const TafsirDrawer = ({ verse, onClose }) => {
  const [tafsir, setTafsir]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tafsirList, setTafsirList]   = useState([]);
  const [selectedId, setSelectedId]   = useState(169); // Ibn Kathir default
  const [showPicker, setShowPicker]   = useState(false);

  useEffect(() => {
    fetchAvailableTafsirs()
      .then(setTafsirList)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!verse) return;
    setLoading(true);
    setTafsir(null);

    fetchTafsirForVerse(verse.verse_key, selectedId)
      .then(setTafsir)
      .catch(() => setTafsir(null))
      .finally(() => setLoading(false));
  }, [verse, selectedId]);

  if (!verse) return null;

  const selectedTafsir = tafsirList.find(t => t.id === selectedId);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150]"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white z-[160] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tafsir</h2>
            <p className="text-sm text-[#2ca4ab] font-medium">Verse {verse.verse_key}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RiCloseLine size={22} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-gray-100">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#2ca4ab] transition-colors"
          >
            <span>{selectedTafsir?.author_name || 'Ibn Kathir'}</span>
            <RiArrowDownSLine size={16} className={`transition-transform ${showPicker ? 'rotate-180' : ''}`} />
          </button>

          {showPicker && tafsirList.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-xl shadow-md bg-white">
              {tafsirList.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setShowPicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    t.id === selectedId ? 'text-[#2ca4ab] font-bold' : 'text-gray-700'
                  }`}
                >
                  {t.author_name}
                  <span className="text-xs text-gray-400 ml-1">({t.language_name})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-[#f9fafb] border-b border-gray-100">
          <p className="text-2xl leading-loose text-right font-serif text-gray-900 rtl">
            {verse.text_uthmani}
          </p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '')}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RiLoader4Line size={28} className="text-[#2ca4ab] animate-spin" />
            </div>
          ) : tafsir ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-[15px]"
              dangerouslySetInnerHTML={{
                __html: tafsir.text || '<p>No tafsir available for this verse.</p>'
              }}
            />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>Could not load tafsir. Try a different selection.</p>
            </div>
          )}
        </div>

        {tafsir && selectedTafsir && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              {selectedTafsir.author_name} · {selectedTafsir.language_name}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TafsirDrawer;