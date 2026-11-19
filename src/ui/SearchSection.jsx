import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiCompass3Line, RiArrowRightLine, RiLoader4Line } from "@remixicon/react";

import { fetchChapters } from "../api/quranApi";
import SearchBar from "../components/search/SearchBar";
import QuickActions from "../components/search/QuickActions";
import api from "../lib/axios";

const SearchSection = () => {
  const [allChapters, setAllChapters] = useState([]);
  const [thematicResults, setThematicResults] = useState([]);
  const [isThematicLoading, setIsThematicLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    fetchChapters()
      .then((chapters) => {
        if (mounted) {
          setAllChapters(Array.isArray(chapters) ? chapters : []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chapters:", error);
        if (mounted) {
          setAllChapters([]);
        }
      });

    // Close thematic dropdown on outside click
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      mounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle live typing query for thematic search
  const handleQueryChange = async (queryText) => {
    if (!queryText || queryText.trim().length < 2) {
      setThematicResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsThematicLoading(true);
    try {
      const response = await api.get('/api/quran/search/topics', {
        params: { q: queryText.trim() }
      });
      const results = response.data.thematic_results || [];
      setThematicResults(results);
      setIsDropdownOpen(results.length > 0);
    } catch (err) {
      console.error("Thematic search lookup error:", err);
    } finally {
      setIsThematicLoading(false);
    }
  };

  const handleGlobalSearch = (query) => {
    const normalizedQuery = query?.toLowerCase().trim();

    if (!normalizedQuery) {
      return;
    }

    if (normalizedQuery.includes("juz")) {
      const number = normalizedQuery.replace(/\D/g, "");

      if (number) {
        navigate(`/juz/${number}`);
        return;
      }
    }

    const found = allChapters.find((chapter) => {
      const name = chapter?.name_simple?.toLowerCase() || "";
      const id = String(chapter?.id || "");

      return (
        name.includes(normalizedQuery) ||
        id === normalizedQuery
      );
    });

    if (found) {
      navigate(`/surah/${found.id}`);
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(query.trim())}`
    );
  };

  const handleSelectVerse = (verseKey) => {
    const [surahId, verseNum] = verseKey.split(':');
    setIsDropdownOpen(false);
    navigate(`/surah/${surahId}/${verseNum}`);
  };

  return (
    <section
      ref={containerRef}
      className="
        relative
        w-full
        min-h-[390px]
        overflow-hidden
        flex
        flex-col
        items-center
        justify-center
        px-4
        py-16
        bg-theme
      "
    >
      {/* Ambient theme lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute
            inset-0
            opacity-80
          "
          style={{
            background:
              "linear-gradient(to bottom, var(--accent-soft), transparent 70%)",
          }}
        />

        <div
          className="
            absolute
            -top-32
            -right-32
            w-96
            h-96
            rounded-full
            blur-3xl
            opacity-40
          "
          style={{
            backgroundColor: "var(--accent)",
          }}
        />

        <div
          className="
            absolute
            -bottom-32
            -left-32
            w-96
            h-96
            rounded-full
            blur-3xl
            opacity-25
          "
          style={{
            backgroundColor: "var(--gold)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Brand */}
        <Link
          to="/"
          className="
            mb-10
            group
            transition-transform
            duration-500
            hover:scale-[1.02]
          "
        >
          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              tracking-[-0.06em]
              leading-none
              text-center
            "
          >
            <span className="text-theme">
              Deen
            </span>

            <span className="text-gold ml-2">
              360
            </span>
          </h1>
        </Link>

        {/* Search Bar with Integrated Thematic Suggestions Dropdown */}
        <div className="w-full relative">
          <SearchBar
            allChapters={allChapters}
            onSearch={handleGlobalSearch}
            onInputChange={handleQueryChange}
          />

          {/* Thematic Storyline Dropdown Preview */}
          {isDropdownOpen && thematicResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto p-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <RiCompass3Line size={16} /> AI Linker Intelligence Connections
                </span>
                {isThematicLoading && <RiLoader4Line size={16} className="text-emerald-400 animate-spin" />}
              </div>

              <div className="space-y-3">
                {thematicResults.map((topic, idx) => (
                  <div key={idx} className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5">
                    <h4 className="text-xs font-bold text-white mb-2 flex justify-between items-center">
                      <span>{topic.topic_title}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                        {topic.verse_count} connected verses
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {topic.verses.map((v, vIdx) => (
                        <div 
                          key={vIdx}
                          onClick={() => handleSelectVerse(v.verse_key)}
                          className="flex justify-between items-center bg-slate-900/80 hover:bg-slate-900 p-2.5 rounded-xl cursor-pointer transition-colors border border-slate-800 group"
                        >
                          <div>
                            <span className="text-xs font-bold text-emerald-300">Surah Verse {v.verse_key}</span>
                            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{v.relation_note}</p>
                          </div>
                          <span className="text-xs text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                            View <RiArrowRightLine size={14} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-5">
          <QuickActions
            allChapters={allChapters}
          />
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center w-full my-5 opacity-80">
          <div
            className="w-32 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--gold))",
            }}
          />

          <span
            className="mx-3 text-lg"
            style={{ color: "var(--gold)" }}
          >
            ✦
          </span>

          <div
            className="w-32 h-px"
            style={{
              background:
                "linear-gradient(to left, transparent, var(--gold))",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchSection;