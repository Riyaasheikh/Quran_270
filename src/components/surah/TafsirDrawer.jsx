import React, { useEffect, useState } from 'react';
import { RiCloseLine, RiLoader4Line, RiArrowDownSLine } from '@remixicon/react';
import { fetchTafsirForVerse, fetchAvailableTafsirs } from '../../api/quranApi';

const TafsirDrawer = ({ verse, onClose }) => {
  const [tafsir, setTafsir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tafsirList, setTafsirList] = useState([]);
  const [selectedId, setSelectedId] = useState(169); // Ibn Kathir default
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchAvailableTafsirs()
      .then(data => setTafsirList(data || []))
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[150] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-[540px] bg-theme-card border-l border-theme z-[160] shadow-2xl flex flex-col theme-transition">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-card">
          <div>
            <h2 className="text-lg font-bold theme-text">Scholarly Tafsir</h2>
            <p className="text-xs theme-accent font-semibold">Ayah {verse.verse_key}</p>
          </div>
          <button
            onClick={onClose}
            className="theme-icon-button theme-icon-button-sm"
            aria-label="Close Tafsir Drawer"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Tafsir Source Picker */}
        <div className="px-6 py-3 border-b border-theme bg-theme-soft/50 relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center justify-between w-full text-xs font-bold theme-secondary hover:theme-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="theme-subtle uppercase tracking-wider">Source:</span>
              <span>{selectedTafsir?.author_name || 'Ibn Kathir'}</span>
            </div>
            <RiArrowDownSLine size={16} className={`transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`} />
          </button>

          {showPicker && tafsirList.length > 0 && (
            <div className="absolute top-full left-6 right-6 mt-1 max-h-48 overflow-y-auto theme-card border border-theme shadow-xl rounded-xl z-10 divide-y divide-theme/40">
              {tafsirList.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setShowPicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs hover:bg-accent-soft transition-colors flex items-center justify-between ${
                    t.id === selectedId ? 'theme-accent font-bold bg-accent-soft' : 'theme-text'
                  }`}
                >
                  <span>{t.author_name}</span>
                  <span className="text-[10px] theme-subtle font-mono">({t.language_name})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verse Script Preview */}
        <div className="px-6 py-4 bg-theme-soft/30 border-b border-theme">
          <p className="font-quran text-xl leading-loose text-right" dir="rtl">
            {verse.text_uthmani}
          </p>
          <p className="text-xs theme-muted mt-2 italic leading-relaxed">
            {verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '')}
          </p>
        </div>

        {/* Commentary Text Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <RiLoader4Line size={32} className="theme-accent animate-spin" />
              <p className="text-xs uppercase tracking-widest theme-subtle font-semibold">
                Loading Exegesis...
              </p>
            </div>
          ) : tafsir ? (
            <div
              className="text-sm md:text-[15px] leading-relaxed theme-secondary space-y-4 select-text font-normal"
              dangerouslySetInnerHTML={{
                __html: tafsir.text || '<p>No commentary recorded for this ayah.</p>'
              }}
            />
          ) : (
            <div className="text-center py-16 theme-muted text-sm">
              <p>Could not load commentary for this verse.</p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        {tafsir && selectedTafsir && (
          <div className="px-6 py-3 border-t border-theme bg-theme-soft text-center">
            <p className="text-[11px] font-semibold theme-subtle uppercase tracking-wider">
              {selectedTafsir.author_name} · {selectedTafsir.language_name}
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default TafsirDrawer;