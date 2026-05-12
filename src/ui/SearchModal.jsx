import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine, RiMicLine, RiMicFill, RiCloseLine,
  RiBookReadLine, RiFileTextLine, RiLoader4Line,
  RiFundsLine, RiHistoryLine, RiBookLine, RiFileList3Line
} from "@remixicon/react";

import {
  getChapterSuggestions,
  getJuzSuggestions,
  searchQuran,
  fetchSpecificVerse,
  fetchChapters 
} from "../api/quranApi";

const SearchModal = ({ isOpen, onClose, allChapters = [] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState({
    surahs: [], juz: [], ayahs: [], jump: null,
  });

  const popularSearches = ["Al-Mulk", "An-Nisa", "Al-Kahf", "Ya-Sin"];
  const trySearching = ["Juz 30", "2:255", "Baqarah", "Yusuf"];
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice search not supported.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setQuery(e.results[0][0].transcript);
    recognition.start();
  };

useEffect(() => {
  if (!query.trim()) {
    if (results.surahs.length > 0 || results.juz.length > 0 || results.jump || results.ayahs.length > 0) {
      setResults({ surahs: [], juz: [], ayahs: [], jump: null });
    }
    setIsSearching(false);
    return;
  }

  const timeoutId = setTimeout(async () => {
    setIsSearching(true); 

    try {
      const q = query.toLowerCase().trim();
      const verseMatch = q.match(/^(\d+)[:\s](\d+)$/);
      let jumpResult = null;
      if (verseMatch) {
        jumpResult = await fetchSpecificVerse(`${verseMatch[1]}:${verseMatch[2]}`);
      }
      const localSurahs = (allChapters || []).filter(s => 
        s.name_simple.toLowerCase().includes(q) || 
        s.id.toString() === q
      ).slice(0, 5);

      const localJuz = getJuzSuggestions(q);
      let apiAyahs = [];
      if (q.length > 2 && localSurahs.length === 0 && localJuz.length === 0) {
        apiAyahs = await searchQuran(q);
      }

      setResults({
        surahs: localSurahs,
        juz: localJuz,
        ayahs: apiAyahs.slice(0, 5),
        jump: jumpResult,
      });
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  }, 350); 

  return () => clearTimeout(timeoutId);
}, [query]);

  const handleNavigate = (path) => {
    navigate(path);
    setQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-[350px] z-[150] bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="border-b sticky top-0 bg-white z-10 p-4">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 focus-within:border-[#8c7355] focus-within:bg-white transition-all">
            {isSearching ? (
              <RiLoader4Line className="text-[#8c7355] animate-spin shrink-0" size={20} />
            ) : (
              <RiSearchLine className="text-gray-400 shrink-0" size={20} />
            )}
            <input 
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Quran..." 
              className="flex-grow py-3 text-[15px] outline-none bg-transparent placeholder:text-gray-400 min-w-0"
            />
            <div className="flex items-center gap-1 shrink-0">
              {query && <RiCloseLine onClick={() => setQuery("")} className="cursor-pointer text-gray-400 hover:text-red-500" size={20} />}
              <button onClick={handleVoiceSearch}>
                {isListening ? <RiMicFill className="text-red-500 animate-pulse" size={20} /> : <RiMicLine className="text-gray-400 hover:text-[#8c7355]" size={20} />}
              </button>
              <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
              <button onClick={onClose}>
                <RiCloseLine className="text-gray-500 hover:text-black" size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
          {query.trim() ? (
            <div className="space-y-6">
              {results.jump && (
                <div>
                  <h4 className="text-[10px] font-black text-[#8c7355] uppercase tracking-[0.2em] mb-3 px-2">Exact Match</h4>
                  <div onClick={() => handleNavigate(`/surah/${results.jump.verse_key.replace(':', '/')}`)} className="p-4 bg-[#fcfaf7] border border-[#e8e1d5] rounded-2xl cursor-pointer hover:bg-white transition-all">
                    <p className="font-serif text-lg text-right mb-2">{results.jump.text_uthmani}</p>
                    <p className="text-xs text-[#8c7355] font-bold italic">Jump to {results.jump.verse_key}</p>
                  </div>
                </div>
              )}

              {results.surahs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">Surahs</h4>
                  {results.surahs.map(s => (
                    <div key={s.id} onClick={() => handleNavigate(`/surah/${s.id}`)} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <RiBookReadLine className="text-gray-300 group-hover:text-[#8c7355]" size={18} />
                        <span className="text-sm font-bold text-gray-700">{s.id}. {s.name_simple}</span>
                      </div>
                      <span className="font-serif text-gray-500 group-hover:text-black">{s.name_arabic}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.juz.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">Juz</h4>
                  {results.juz.map(j => (
                    <div key={j.id} onClick={() => handleNavigate(`/juz/${j.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group">
                      <RiFileTextLine className="text-gray-300 group-hover:text-[#8c7355]" size={18} />
                      <span className="text-sm font-bold text-gray-700">Juz {j.id}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.ayahs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">Verses</h4>
                  {results.ayahs.map((a, i) => (
                    <div key={i} onClick={() => handleNavigate(`/surah/${a.verse_key.replace(':', '/')}`)} className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                      <p className="text-[10px] font-bold text-[#bfa07d] mb-1">{a.verse_key}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 italic" dangerouslySetInnerHTML={{ __html: a.text }} />
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && results.surahs.length === 0 && results.juz.length === 0 && !results.jump && results.ayahs.length === 0 && (
                <div className="text-center py-10">
                  <RiHistoryLine size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No matches found for "{query}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                  <RiFundsLine size={14} /> Popular searches
                </h4>
                <div className="flex flex-wrap gap-2 px-2">
                  {popularSearches.map((item) => (
                    <button 
                      key={item} 
                      onClick={() => setQuery(item)}
                      className="px-4 py-2 rounded-full border border-gray-100 bg-white text-xs font-bold text-gray-600 hover:border-[#8c7355] hover:text-[#8c7355] transition-all shadow-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                  <RiSearchLine size={14} /> Try searching for
                </h4>
                <div className="space-y-1">
                  {trySearching.map((item) => (
                    <div 
                      key={item} 
                      onClick={() => setQuery(item)}
                      className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-[#fcfaf7] cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#8c7355] group-hover:text-white transition-all">
                        {item.includes(":") ? <RiFileList3Line size={16} /> : <RiBookLine size={16} />}
                      </div>
                      <span className="text-[14px] text-gray-700 font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchModal;