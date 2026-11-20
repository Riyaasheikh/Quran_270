import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiMicLine,
  RiMicFill,
  RiSearchLine,
  RiCloseLine,
  RiBookReadLine,
  RiFileTextLine,
  RiLoader4Line,
} from "@remixicon/react";

import {
  getChapterSuggestions,
  getJuzSuggestions,
  searchQuran,
  fetchSpecificVerse,
} from "../../api/quranApi";
import { ThemeContext } from "../../context/ThemeContext";

const SearchBar = ({ allChapters = [], onSearch, onInputChange }) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState({
    surahs: [],
    juz: [],
    ayahs: [],
    jump: null,
  });

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQuery(transcript);
      onInputChange?.(transcript);
      setShowSuggestions(true);
    };

    recognition.start();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ surahs: [], juz: [], ayahs: [], jump: null });
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const normalized = trimmed.toLowerCase();
        const verseMatch = normalized.match(/^(\d+)[:\s](\d+)$/);

        let jumpResult = null;
        if (verseMatch) {
          const verseKey = `${verseMatch[1]}:${verseMatch[2]}`;
          jumpResult = await fetchSpecificVerse(verseKey);
        }

        let localSurahs = getChapterSuggestions(allChapters, trimmed);
        if (normalized === "surah" || normalized === "surat") {
          localSurahs = allChapters.slice(0, 10);
        }

        const localJuz = getJuzSuggestions(trimmed);
        const isNavigationSearch =
          localSurahs.length > 0 || localJuz.length > 0 || Boolean(jumpResult);

        let apiAyahs = [];
        if (!isNavigationSearch && normalized.length > 2) {
          apiAyahs = await searchQuran(trimmed);
        }

        setResults({
          surahs: localSurahs,
          juz: localJuz,
          ayahs: Array.isArray(apiAyahs) ? apiAyahs.slice(0, 5) : [],
          jump: jumpResult,
        });
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query, allChapters]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    onInputChange?.(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    onSearch?.(query);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowSuggestions(false);
    setQuery("");
    onInputChange?.("");
  };

  const handleClear = () => {
    setQuery("");
    onInputChange?.("");
  };

  const hasResults =
    Boolean(results.jump) ||
    results.surahs.length > 0 ||
    results.juz.length > 0 ||
    results.ayahs.length > 0;

  return (
    <div className="relative w-full z-20" ref={searchRef} data-theme={theme}>
      <form onSubmit={handleSubmit} className="relative group">
        {/* Left Search / Loading Icon */}
        <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none">
          {isSearching ? (
            <RiLoader4Line className="animate-spin theme-accent" size={20} />
          ) : (
            <RiSearchLine size={20} className="theme-muted" />
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onChange={handleInputChange}
          placeholder={
            isListening
              ? "Listening..."
              : "Search Surah, Juz, Ayah, or topic..."
          }
          aria-label="Search Surah, Juz, Ayah, or topic"
          className={`w-full min-h-[48px] sm:min-h-[56px] py-3.5 sm:py-4 pl-12 sm:pl-14 pr-24 sm:pr-28 rounded-full shadow-lg focus:shadow-xl outline-none text-sm sm:text-base md:text-lg transition-all border bg-theme-input theme-text ${
            isListening ? "border-gold ring-2 ring-[var(--gold)]" : "border-theme"
          }`}
        />

        {/* Right Controls: Clear & Voice */}
        <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="p-2 rounded-full transition-colors cursor-pointer theme-muted hover:theme-text"
            >
              <RiCloseLine size={20} />
            </button>
          )}

          <button
            type="button"
            onClick={handleVoiceSearch}
            aria-label={isListening ? "Stop voice search" : "Start voice search"}
            className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer ${
              isListening
                ? "bg-accent animate-pulse"
                : "bg-accent-soft theme-accent hover:scale-105"
            }`}
          >
            {isListening ? <RiMicFill size={20} /> : <RiMicLine size={20} />}
          </button>
        </div>
      </form>

      {/* Solid Opaque Suggestions Dropdown */}
      {showSuggestions && hasResults && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border border-theme bg-theme-card theme-text overflow-hidden max-h-[65vh] sm:max-h-[480px] overflow-y-auto z-30"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          {/* Exact Verse Jump */}
          {results.jump && (
            <div className="border-b border-theme">
              <div className="px-4 sm:px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest flex justify-between bg-theme-soft theme-gold">
                <span>Exact Verse Match</span>
                <span className="hidden sm:inline text-[10px]">Click to Jump</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const [sId, vNum] = results.jump.verse_key.split(":");
                  handleNavigate(`/surah/${sId}/${vNum}`);
                }}
                className="w-full text-left px-4 sm:px-6 py-4 cursor-pointer transition-colors bg-theme-card"
              >
                <p
                  dir="rtl"
                  className="text-right font-arabic text-xl sm:text-2xl leading-loose theme-text"
                >
                  {results.jump.text_uthmani}
                </p>

                <p className="text-xs sm:text-sm mt-2 italic theme-muted">
                  {results.jump?.translations?.[0]?.text}
                  <span className="font-bold not-italic ml-2 theme-gold">
                    ({results.jump.verse_key})
                  </span>
                </p>
              </button>
            </div>
          )}

          {/* Surahs */}
          {results.surahs.length > 0 && (
            <div>
              <div className="px-4 sm:px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-theme-soft theme-muted">
                Surahs
              </div>

              {results.surahs.map((surah) => (
                <button
                  type="button"
                  key={surah.id}
                  onClick={() => handleNavigate(`/surah/${surah.id}`)}
                  className="w-full text-left flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 cursor-pointer transition-colors border-b last:border-b-0 border-theme bg-theme-card"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <RiBookReadLine size={18} className="shrink-0 theme-accent" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate theme-text">
                        {surah.id}. {surah.name_simple}
                      </p>
                      <p className="text-xs truncate theme-muted">
                        {surah.translated_name?.name}
                      </p>
                    </div>
                  </div>

                  <p
                    dir="rtl"
                    className="font-arabic text-xl sm:text-2xl shrink-0 theme-text"
                  >
                    {surah.name_arabic}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Juz */}
          {results.juz.length > 0 && (
            <div className="border-t border-theme">
              <div className="px-4 sm:px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-theme-soft theme-muted">
                Juz
              </div>

              {results.juz.map((juzItem) => (
                <button
                  type="button"
                  key={juzItem.id}
                  onClick={() => handleNavigate(`/juz/${juzItem.id}`)}
                  className="w-full text-left flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 cursor-pointer transition-colors border-b last:border-b-0 border-theme bg-theme-card"
                >
                  <RiBookReadLine size={18} className="shrink-0 theme-gold" />
                  <div>
                    <p className="font-bold text-sm sm:text-base theme-text">
                      {juzItem.name}
                    </p>
                    <p className="text-xs theme-muted">Quran Section</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Translation / Ayah Results */}
          {results.ayahs.length > 0 && (
            <div className="border-t border-theme">
              <div className="px-4 sm:px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-theme-soft theme-muted">
                Translation Results
              </div>

              {results.ayahs.map((ayah, idx) => (
                <button
                  type="button"
                  key={ayah.verse_key ? `${ayah.verse_key}-${idx}` : idx}
                  onClick={() => {
                    const [sId, vNum] = ayah.verse_key.split(":");
                    handleNavigate(`/surah/${sId}/${vNum}`);
                  }}
                  className="w-full text-left px-4 sm:px-6 py-3.5 cursor-pointer transition-colors border-b last:border-b-0 border-theme bg-theme-card"
                >
                  <div className="flex items-center gap-2 mb-1.5 theme-gold">
                    <RiFileTextLine size={16} />
                    <span className="text-xs font-black">{ayah.verse_key}</span>
                  </div>

                  <p
                    dir="rtl"
                    className="text-right font-arabic text-base sm:text-lg line-clamp-1 mb-1.5 theme-text"
                  >
                    {ayah.text}
                  </p>

                  <p
                    className="text-xs line-clamp-1 italic theme-muted"
                    dangerouslySetInnerHTML={{
                      __html: ayah.translations?.[0]?.text || "",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;