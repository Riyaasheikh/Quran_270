import React, { useEffect, useState } from 'react';
import { RiCloseLine, RiLoader4Line, RiCheckLine, RiSearchLine } from '@remixicon/react';
import { fetchChapterReciters } from '../../api/quranApi';

const ReciterSelector = ({ selectedId, onSelect, onClose }) => {
  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChapterReciters()
      .then(setReciters)
      .catch((err) => console.error("Failed to load reciters", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reciters.filter(r => {
    const name = r.reciter_name || r.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[170]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-[180] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">Select Reciter</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RiCloseLine size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2.5 transition-focus-within ring-2 ring-transparent focus-within:ring-[#2ca4ab]/20">
            <RiSearchLine size={20} className="text-gray-400" />
            <input
              placeholder="Search reciter name..."
              className="bg-transparent w-full outline-none text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RiLoader4Line size={40} className="text-[#2ca4ab] animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading Reciters...</p>
            </div>
          ) : (
            filtered.map(reciter => (
              <button
                key={reciter.id}
                onClick={() => { onSelect(reciter); onClose(); }}
                className={`w-full flex items-center justify-between p-4 rounded-xl mb-1 transition-all ${
                  reciter.id === selectedId ? 'bg-[#2ca4ab]/10 border border-[#2ca4ab]/20' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`font-bold text-sm ${reciter.id === selectedId ? 'text-[#2ca4ab]' : 'text-gray-800'}`}>
                    {reciter.reciter_name || reciter.name}
                  </span>
                  {reciter.style && (
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mt-1">
                      {reciter.style.name}
                    </span>
                  )}
                </div>
                {reciter.id === selectedId && <RiCheckLine size={20} className="text-[#2ca4ab]" />}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ReciterSelector;