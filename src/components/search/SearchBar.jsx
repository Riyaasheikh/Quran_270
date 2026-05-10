import React, { useState, useEffect, useRef } from "react";
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

const SearchBar = ({ allChapters = [] }) => {
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
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "ar-SA";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setQuery(transcript);
      setShowSuggestions(true);
    };

    recognition.start();
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);
  useEffect(() => {
    if (!query.trim()) {
      setResults((prev) => ({
  ...prev,
  surahs: [],
  juz: [],
  ayahs: [],
  jump: null,
}));
      setIsSearching(false);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query.toLowerCase().trim();
        const verseMatch =
          q.match(/^(\d+)[:\s](\d+)$/);

        let jumpResult = null;

        if (verseMatch) {
          const verseKey = `${verseMatch[1]}:${verseMatch[2]}`;

          jumpResult =
            await fetchSpecificVerse(verseKey);
        }
        let localSurahs =
          getChapterSuggestions(
            allChapters,
            query
          );
        if (
          q === "surah" ||
          q === "surat"
        ) {
          localSurahs =
            allChapters.slice(0, 10);
        }
        const localJuz =
          getJuzSuggestions(query);
        const isNavigationSearch =
          localSurahs.length > 0 ||
          localJuz.length > 0 ||
          jumpResult;
        let apiAyahs = [];

        if (
          !isNavigationSearch &&
          q.length > 2
        ) {
          apiAyahs =
            await searchQuran(query);
        }

        setResults({
          surahs: localSurahs,
          juz: localJuz,
          ayahs: apiAyahs.slice(0, 5),
          jump: jumpResult,
        });
      } catch (error) {
        console.error(
          "Search Error:",
          error
        );
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleNavigate = (path) => {
    navigate(path);

    setShowSuggestions(false);
    setQuery("");
  };

  return (
    <div
      className="relative w-full z-[120]"
      ref={searchRef}
    >

      <div className="relative group">

        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {isSearching ? (
            <RiLoader4Line
              className="text-[#C0E2CA] animate-spin"
              size={20}
            />
          ) : (
            <RiSearchLine
              className="text-gray-400 group-focus-within:text-[#C0E2CA] transition-colors"
              size={20}
            />
          )}
        </div>

        <input
          type="text"
          value={query}
          onFocus={() =>
            setShowSuggestions(true)
          }
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder={
            isListening
              ? "Listening..."
              : "Search Surah, Juz, Ayah..."
          }
          className={`w-full py-4 md:py-5 pl-14 pr-14 bg-white border-none rounded-full shadow-lg focus:shadow-2xl outline-none text-lg transition-all ${
            isListening
              ? "ring-2 ring-[#8c7355]"
              : ""
          }`}
        />

        <div className="absolute inset-y-0 right-5 flex items-center gap-2">
          {query && (
            <RiCloseLine
              size={22}
              className="text-gray-400 cursor-pointer hover:text-red-500"
              onClick={() =>
                setQuery("")
              }
            />
          )}

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`transition-colors ${
              isListening
                ? "text-[#C0E2CA] animate-pulse"
                : "text-gray-400 hover:text-[#8c7355]"
            }`}
          >
            {isListening ? (
              <RiMicFill size={24} />
            ) : (
              <RiMicLine size={24} />
            )}
          </button>
        </div>
      </div>

      {showSuggestions &&
        (
          results.jump ||
          results.surahs.length > 0 ||
          results.juz.length > 0 ||
          results.ayahs.length > 0
        ) && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[550px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">

            {results.jump && (
              <div className="border-b border-gray-100 bg-teal-50/30">
                <div className="p-3 px-6 text-[11px] font-bold text-[#8c7355] uppercase tracking-widest flex justify-between">
                  <span>
                    Exact Match
                  </span>

                  <span className="text-[10px]">
                    Click to Jump
                  </span>
                </div>

                <div
                  onClick={() =>
                    handleNavigate(
                      `/${results.jump.verse_key.replace(
                        ":",
                        "/"
                      )}`
                    )
                  }
                  className="px-6 py-5 cursor-pointer hover:bg-teal-50 transition-colors"
                >
                  <p className="text-right font-serif text-2xl text-gray-800 leading-loose">
                    {
                      results.jump
                        .text_uthmani
                    }
                  </p>

                  <p className="text-sm text-gray-600 mt-2 italic">
                    {
                      results.jump
                        ?.translations?.[0]?.text
                    }

                    <span className="font-bold ml-2 text-[#8c7355]">
                      (
                      {
                        results.jump
                          .verse_key
                      }
                      )
                    </span>
                  </p>
                </div>
              </div>
            )}

            {results.surahs.length >
              0 && (
              <div>
                <div className="p-3 px-6 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Surahs
                </div>

                {results.surahs.map(
                  (s) => (
                    <div
                      key={s.id}
                      onClick={() =>
                        handleNavigate(
                          `/${s.id}`
                        )
                      }
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-teal-50/50 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <RiBookReadLine
                          size={18}
                          className="text-gray-300 group-hover:text-[#8c7355]"
                        />

                        <div>
                          <p className="font-bold text-gray-700">
                            {s.id}.{" "}
                            {
                              s.name_simple
                            }
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              s
                                .translated_name
                                ?.name
                            }
                          </p>
                        </div>
                      </div>

                      <p className="font-arabic text-2xl text-gray-700">
                        {
                          s.name_arabic
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {results.juz.length >
              0 && (
              <div className="border-t border-gray-100">
                <div className="p-3 px-6 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Juz
                </div>

                {results.juz.map(
                  (j) => (
                    <div
                      key={j.id}
                      onClick={() =>
                        handleNavigate(
                          `/juz/${j.id}`
                        )
                      }
                      className="flex items-center gap-4 px-6 py-4 hover:bg-teal-50/50 cursor-pointer"
                    >
                      <RiBookReadLine
                        size={18}
                        className="text-[#8c7355]"
                      />

                      <div>
                        <p className="font-bold text-gray-700">
                          {j.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          Quran
                          Section
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {results.ayahs.length >
              0 && (
              <div className="border-t border-gray-100">
                <div className="p-3 px-6 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Translation
                  Results
                </div>

                {results.ayahs.map(
                  (
                    a,
                    idx
                  ) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleNavigate(
                          `/${a.verse_key.replace(
                            ":",
                            "/"
                          )}`
                        )
                      }
                      className="px-6 py-4 hover:bg-teal-50/50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-2 text-[#8c7355]">
                        <RiFileTextLine
                          size={16}
                        />

                        <span className="text-xs font-black">
                          {
                            a.verse_key
                          }
                        </span>
                      </div>

                      <p className="text-right font-serif text-lg text-gray-800 line-clamp-1 mb-2">
                        {a.text}
                      </p>

                      <p
                        className="text-xs text-gray-500 line-clamp-1 italic"
                        dangerouslySetInnerHTML={{
                          __html:
                            a
                              .translations?.[0]
                              ?.text ||
                            "",
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default SearchBar;