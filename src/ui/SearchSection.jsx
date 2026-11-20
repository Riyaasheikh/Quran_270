import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiCompass3Line, RiArrowRightLine, RiLoader4Line } from "@remixicon/react";

import { fetchChapters } from "../api/quranApi";
import { ThemeContext } from "../context/ThemeContext";
import SearchBar from "../components/search/SearchBar";
import QuickActions from "../components/search/QuickActions";
import api from "../lib/axios";

const SearchSection = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [allChapters, setAllChapters] = useState([]);
  const [thematicResults, setThematicResults] = useState([]);
  const [isThematicLoading, setIsThematicLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchChapters()
      .then((chapters) => {
        if (isMounted) {
          setAllChapters(Array.isArray(chapters) ? chapters : []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chapters:", error);
        if (isMounted) {
          setAllChapters([]);
        }
      });

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleQueryChange = useCallback(async (queryText) => {
    const trimmed = queryText?.trim() || "";

    if (trimmed.length < 2) {
      setThematicResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsThematicLoading(true);
    try {
      const response = await api.get("/api/quran/search/topics", {
        params: { q: trimmed },
      });
      const results = Array.isArray(response?.data?.thematic_results)
        ? response.data.thematic_results
        : [];
      setThematicResults(results);
      setIsDropdownOpen(results.length > 0);
    } catch (err) {
      console.error("Thematic search lookup error:", err);
      setThematicResults([]);
      setIsDropdownOpen(false);
    } finally {
      setIsThematicLoading(false);
    }
  }, []);

  const handleGlobalSearch = useCallback(
    (query) => {
      const trimmed = query?.trim() || "";
      const normalized = trimmed.toLowerCase();

      if (!normalized) return;
      setIsDropdownOpen(false);

      if (normalized.includes("juz")) {
        const juzNumber = normalized.replace(/\D/g, "");
        if (juzNumber) {
          navigate(`/juz/${juzNumber}`);
          return;
        }
      }

      const matchedChapter = allChapters.find((chapter) => {
        const name = chapter?.name_simple?.toLowerCase() || "";
        const id = String(chapter?.id || "");
        return name.includes(normalized) || id === normalized;
      });

      if (matchedChapter) {
        navigate(`/surah/${matchedChapter.id}`);
        return;
      }

      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [allChapters, navigate]
  );

  const handleSelectVerse = useCallback(
    (verseKey) => {
      if (!verseKey) return;
      const [surahId, verseNum] = verseKey.split(":");
      setIsDropdownOpen(false);
      navigate(verseNum ? `/surah/${surahId}/${verseNum}` : `/surah/${surahId}`);
    },
    [navigate]
  );

  return (
    <section
      ref={containerRef}
      data-theme={theme}
      className="relative w-full min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10 bg-theme theme-text"
    >
      {/* Ambient theme lighting using index.css CSS variables */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: "linear-gradient(to bottom, var(--accent-soft), transparent 72%)",
          }}
        />
        <div
          className="absolute -top-28 -right-28 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <div
          className="absolute -bottom-28 -left-28 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "var(--gold)" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Brand */}
        <Link
          to="/"
          className="mb-7 sm:mb-9 group transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.06em] leading-none text-center select-none">
            <span className="theme-text">Deen</span>
            <span className="ml-2 theme-gold">360</span>
          </h1>
        </Link>

        {/* Search Bar + Thematic Dropdown */}
        <div className="w-full relative z-30">
          <SearchBar
            allChapters={allChapters}
            onSearch={handleGlobalSearch}
            onInputChange={handleQueryChange}
          />

          {isDropdownOpen && thematicResults.length > 0 && (
            <div className="mt-3 rounded-2xl shadow-2xl border border-theme bg-theme-card theme-text overflow-hidden max-h-96 overflow-y-auto p-3 sm:p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-theme">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider theme-accent">
                  <RiCompass3Line size={16} />
                  AI Linker Intelligence Connections
                </span>
                {isThematicLoading && (
                  <RiLoader4Line size={16} className="animate-spin theme-accent" />
                )}
              </div>

              <div className="space-y-3">
                {thematicResults.map((topic, idx) => (
                  <div
                    key={topic.topic_title ? `${topic.topic_title}-${idx}` : idx}
                    className="rounded-xl p-3 sm:p-3.5 border border-theme bg-theme-soft"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs sm:text-sm font-bold theme-text">
                        {topic.topic_title}
                      </h4>
                      <span className="theme-badge theme-badge-accent">
                        {topic.verse_count} connected verses
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(topic.verses || []).map((verse, vIdx) => (
                        <button
                          type="button"
                          key={verse.verse_key ? `${verse.verse_key}-${vIdx}` : vIdx}
                          onClick={() => handleSelectVerse(verse.verse_key)}
                          className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border border-theme bg-theme-card group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold block theme-accent">
                              Verse {verse.verse_key}
                            </span>
                            <p className="text-xs mt-0.5 line-clamp-1 theme-muted">
                              {verse.relation_note}
                            </p>
                          </div>

                          <span className="text-xs font-medium flex items-center gap-1 shrink-0 theme-muted group-hover:translate-x-0.5 transition-transform">
                            View
                            <RiArrowRightLine size={14} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="w-full mt-4 sm:mt-5 relative z-20">
          <QuickActions allChapters={allChapters} />
        </div>

        {/* Decorative Divider */}
        <div
          className="flex items-center justify-center w-full mt-7 sm:mt-9 opacity-85"
          aria-hidden="true"
        >
          <div
            className="w-20 sm:w-32 h-px"
            style={{
              background: "linear-gradient(to right, transparent, var(--gold))",
            }}
          />
          <span className="mx-3 text-lg theme-gold">✦</span>
          <div
            className="w-20 sm:w-32 h-px"
            style={{
              background: "linear-gradient(to left, transparent, var(--gold))",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchSection;