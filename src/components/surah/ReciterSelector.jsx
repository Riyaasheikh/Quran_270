import React, { useEffect, useState } from 'react';
import { RiCloseLine, RiLoader4Line, RiCheckLine, RiSearchLine } from '@remixicon/react';
import { fetchChapterReciters } from '../../api/quranApi';
import { useTheme } from '../../context/ThemeContext';

const ReciterSelector = ({ selectedId, onSelect, onClose }) => {
  const { theme, themes } = useTheme();

  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChapterReciters()
      .then((data) => {
        // Fallback default list if API returns empty
        const defaultReciters = [
          { id: 7, reciter_name: 'Mishary Rashid Alafasy', style: { name: 'Murattal' } },
          { id: 3, reciter_name: 'Abdul Basit Abdul Samad', style: { name: 'Murattal' } },
          { id: 1, reciter_name: 'Abdur-Rahman as-Sudais', style: { name: 'Murattal' } },
          { id: 4, reciter_name: 'Abu Bakr al-Shatri', style: { name: 'Murattal' } },
          { id: 5, reciter_name: 'Hani ar-Rifai', style: { name: 'Murattal' } },
          { id: 6, reciter_name: 'Mahmoud Khaleel Al-Husary', style: { name: 'Murattal' } },
        ];
        setReciters(data?.length ? data : defaultReciters);
      })
      .catch((err) => {
        console.error("Failed to load reciters", err);
        setReciters([
          { id: 7, reciter_name: 'Mishary Rashid Alafasy', style: { name: 'Murattal' } },
          { id: 3, reciter_name: 'Abdul Basit Abdul Samad', style: { name: 'Murattal' } },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = reciters.filter((r) => {
    const name = r.reciter_name || r.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[170]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] theme-card theme-card-static z-[180] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-theme">
        <div className="flex items-center justify-between px-6 py-5 border-b border-theme">
          <h2 className="text-xl font-bold theme-text">Select Reciter</h2>
          <button onClick={onClose} className="theme-button-ghost !min-h-[2.25rem] !w-[2.25rem] !p-0 rounded-full flex items-center justify-center transition cursor-pointer">
            <RiCloseLine size={20} className="theme-muted hover:theme-text" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-theme bg-theme-soft/30">
          <div className="flex items-center gap-3 bg-theme-soft border border-theme rounded-2xl px-4 py-2.5 focus-within:border-accent transition">
            <RiSearchLine size={18} className="theme-muted shrink-0" />
            <input
              placeholder="Search reciter name..."
              className="bg-transparent w-full outline-none text-xs theme-text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RiLoader4Line size={32} className="theme-accent animate-spin" />
              <p className="text-xs theme-muted font-medium">Loading Reciters...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-xs theme-muted">
              No reciters found matching "{search}"
            </div>
          ) : (
            filtered.map((reciter) => {
              const isSelected = reciter.id === selectedId;
              const reciterName = reciter.reciter_name || reciter.name;
              const reciterStyle = reciter.style?.name || reciter.style;

              return (
                <button
                  key={reciter.id}
                  type="button"
                  onClick={() => {
                    onSelect(reciter);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition cursor-pointer border ${
                    isSelected 
                      ? 'bg-accent-soft border-accent/60 shadow-xs' 
                      : 'bg-theme-soft/40 border-theme hover:border-accent/40'
                  }`}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className={`text-xs font-bold ${isSelected ? 'theme-accent' : 'theme-text'}`}>
                      {reciterName}
                    </span>
                    {reciterStyle && (
                      <span className="text-[10px] uppercase tracking-wider theme-muted font-semibold mt-0.5">
                        {typeof reciterStyle === 'string' ? reciterStyle : 'Murattal'}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <RiCheckLine size={16} className="theme-accent" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ReciterSelector;