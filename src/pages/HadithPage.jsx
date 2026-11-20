import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  RiSearchLine,
  RiSparklingFill,
  RiBookOpenLine,
  RiCloseLine,
  RiLoader4Line,
  RiBookmarkFill,
  RiBookmarkLine,
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import HadithCard from "../components/hadith/HadithCard";
import HadithDetailDrawer from "../components/hadith/HadithDetailDrawer";
import AuthPromptModal from "../components/global/AuthPromptModal";

import { AuthContext } from "../context/AuthContext";
import { useBookmarks } from "../hooks/useBookmarks";
import {
  HADITH_EDITIONS,
  fetchCollectionBooks,
  fetchHadithsByBook,
  fetchSingleHadith,
} from "../api/hadithApi";

const POPULAR_SEARCHES = [
  "Marriage",
  "Prayer",
  "Fasting",
  "Zakat",
  "Knowledge",
  "Patience",
  "Parents",
  "Manners",
];

const TOPIC_SYNONYMS = {
  marriage: ["marriage", "wedlock", "nikaah", "nikah"],
  prayer: ["prayer", "salat", "salah", "times of the prayers"],
  fasting: ["fasting", "sawm", "ramadan"],
  zakat: ["zakat", "charity", "obligatory charity"],
  knowledge: ["knowledge", "ilm"],
  patience: ["patience", "sabr"],
  parents: ["parents", "mother", "father", "kinship"],
  manners: ["manners", "adab", "character", "good manners"],
};

const HadithPage = () => {
  const { user } = useContext(AuthContext);
  const { getSavedItems, toggleBookmark } = useBookmarks("deen360_saved_hadiths");

  const [selectedCollection, setSelectedCollection] = useState("bukhari");
  const [books, setBooks] = useState({});
  const [selectedBook, setSelectedBook] = useState(1);
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [activeHadith, setActiveHadith] = useState(null);

  // Tab mode: 'browse' | 'bookmarks'
  const [viewMode, setViewMode] = useState("browse");

  // Auth gate modal & bookmarked list
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedHadiths, setSavedHadiths] = useState([]);

  // Sync saved bookmarks safely without risking an infinite loop if getSavedItems isn't memoized
  useEffect(() => {
    setSavedHadiths(getSavedItems());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, viewMode]);

  const handleBookmarkToggle = useCallback(
    (hadithObj) => {
      if (!hadithObj) return;

      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }

      const updated = toggleBookmark(hadithObj, () => setIsAuthModalOpen(true));
      if (Array.isArray(updated)) {
        setSavedHadiths(updated);
      } else {
        setSavedHadiths(getSavedItems());
      }
    },
    [user, toggleBookmark, getSavedItems]
  );

  // 1. Fetch collection chapters / books
  useEffect(() => {
    if (viewMode === "bookmarks") return;

    let isMounted = true;
    setLoading(true);
    setSearchError("");
    setFilterQuery("");

    fetchCollectionBooks(selectedCollection)
      .then((data) => {
        if (!isMounted) return;
        const normalizedBooks = data && typeof data === "object" ? data : {};
        setBooks(normalizedBooks);

        const keys = Object.keys(normalizedBooks)
          .map(Number)
          .filter((n) => !Number.isNaN(n))
          .sort((a, b) => a - b);

        if (keys.length > 0) {
          setSelectedBook((prev) =>
            keys.includes(Number(prev)) ? Number(prev) : keys[0]
          );
        }
      })
      .catch((err) => {
        console.error("Chapters fetch error:", err);
        if (isMounted) {
          setBooks({});
          setSearchError("Unable to load chapters right now.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCollection, viewMode]);

  // 2. Fetch Hadiths for selected chapter
  useEffect(() => {
    if (viewMode === "bookmarks" || !selectedBook) return;

    let isMounted = true;
    setLoading(true);
    setSearchError("");

    fetchHadithsByBook(selectedCollection, selectedBook)
      .then((data) => {
        if (!isMounted) return;
        setHadiths(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Hadiths fetch error:", err);
        if (isMounted) {
          setHadiths([]);
          setSearchError("Unable to load Hadiths for this chapter.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCollection, selectedBook, viewMode]);

  const findMatchingChapter = useCallback(
    (rawTerm) => {
      const lower = rawTerm.toLowerCase().trim();
      const terms = TOPIC_SYNONYMS[lower] || [lower];
      return Object.entries(books).find(([_, name]) =>
        terms.some((t) => String(name).toLowerCase().includes(t))
      );
    },
    [books]
  );

  // Direct Hadith number lookup or chapter/keyword filter
  const handleSearchSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const q = searchQuery.trim();
    setSearchError("");

    if (!q) {
      setFilterQuery("");
      return;
    }

    // Case A: Exact Hadith Number Lookup
    if (/^\d+$/.test(q)) {
      try {
        setLoading(true);
        setFilterQuery("");
        const result = await fetchSingleHadith(selectedCollection, Number(q));
        setHadiths(result ? [result] : []);
      } catch {
        setHadiths([]);
        setSearchError(
          `Hadith #${q} was not found in ${
            HADITH_EDITIONS[selectedCollection]?.name || "this collection"
          }.`
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Case B: Jump to matching chapter if found, otherwise filter current list
    const matchedChapter = findMatchingChapter(q);
    if (matchedChapter) {
      setSelectedBook(Number(matchedChapter[0]));
      setFilterQuery("");
    } else {
      setFilterQuery(q);
    }
  };

  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
    setSearchError("");
    const matchedChapter = findMatchingChapter(topic);
    if (matchedChapter) {
      setSelectedBook(Number(matchedChapter[0]));
      setFilterQuery("");
    } else {
      setFilterQuery(topic);
    }
  };

  const displayedHadiths = useMemo(() => {
    const sourceList = viewMode === "bookmarks" ? savedHadiths : hadiths;
    const q = (filterQuery || searchQuery).toLowerCase().trim();
    if (!q || /^\d+$/.test(q)) return sourceList;

    const terms = TOPIC_SYNONYMS[q] || [q];
    return sourceList.filter((h) => {
      const haystack = `${h.english || ""} ${h.urdu || ""} ${h.arabic || ""} ${
        h.hadithNumber || ""
      }`.toLowerCase();
      return terms.some((t) => haystack.includes(t));
    });
  }, [viewMode, savedHadiths, hadiths, filterQuery, searchQuery]);

  const sortedBookEntries = useMemo(
    () =>
      Object.entries(books)
        .filter(([num]) => !Number.isNaN(Number(num)))
        .sort((a, b) => Number(a[0]) - Number(b[0])),
    [books]
  );

  const currentEdition =
    HADITH_EDITIONS[selectedCollection] || HADITH_EDITIONS.bukhari;

  const isActiveHadithBookmarked = useMemo(
    () =>
      Boolean(
        activeHadith && savedHadiths.some((item) => item.id === activeHadith.id)
      ),
    [activeHadith, savedHadiths]
  );

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay pt-5 pb-10 sm:pt-6 sm:pb-12 px-4 sm:px-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />

          {/* Top Back Button */}
          <div className="relative z-10 max-w-7xl mx-auto mb-5 sm:mb-6">
            <Link
              to="/"
              className="theme-button-outline !min-h-[2.35rem] !px-4 !rounded-full text-xs inline-flex items-center gap-2"
            >
              <RiArrowLeftLine size={16} />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
              <RiSparklingFill size={13} />
              <span>Canonical Sunnah Library</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              The Comprehensive Hadith Corpus
            </h1>
            <p className="theme-muted text-xs sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Explore authentic Hadiths across the Kutub al-Sittah with complete
              Arabic, English, and Urdu translations.
            </p>

            {/* View Mode Toggle (Browse vs Bookmarks) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
              <button
                type="button"
                onClick={() => setViewMode("browse")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "browse"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiBookOpenLine size={15} />
                <span>Browse All Collections</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("bookmarks")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "bookmarks"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiBookmarkFill size={15} />
                <span>Saved Bookmarks ({savedHadiths.length})</span>
              </button>
            </div>

            {/* Collection Switcher Buttons */}
            {viewMode === "browse" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
                {Object.values(HADITH_EDITIONS).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setSelectedCollection(col.id);
                      setSelectedBook(1);
                      setSearchQuery("");
                      setFilterQuery("");
                      setSearchError("");
                    }}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCollection === col.id
                        ? "bg-accent-soft text-accent border border-accent/40 font-bold"
                        : "bg-theme-card border border-theme theme-muted hover:theme-text"
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-2xl mx-auto mt-5 sm:mt-6"
            >
              <RiSearchLine
                size={20}
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 theme-subtle pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search keyword or Hadith # and press Enter..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (!val.trim()) setFilterQuery("");
                  if (searchError) setSearchError("");
                }}
                className="theme-input w-full !py-3 sm:!py-3.5 pl-10 sm:pl-12 pr-24 sm:pr-28 text-xs sm:text-sm rounded-2xl shadow-lg border border-theme"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterQuery("");
                      setSearchError("");
                    }}
                    aria-label="Clear search"
                    className="theme-icon-button theme-icon-button-sm cursor-pointer"
                  >
                    <RiCloseLine size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  className="theme-button !py-1.5 !px-3 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Search Error Banner */}
            {searchError && (
              <div
                className="max-w-2xl mx-auto mt-3 px-4 py-2.5 rounded-xl bg-theme-card border border-theme text-xs font-semibold flex items-center justify-center gap-2"
                style={{ color: "var(--danger)" }}
              >
                <RiErrorWarningLine size={16} className="shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Quick Topic Pills */}
            {viewMode === "browse" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                <span className="text-[11px] theme-subtle font-medium mr-1">
                  Quick Topics:
                </span>
                {POPULAR_SEARCHES.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-theme-soft/80 border border-theme theme-muted hover:theme-accent hover:border-accent/40 transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {viewMode === "browse" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Mobile & Tablet Chapter Selector */}
              <div className="lg:hidden space-y-1.5">
                <label
                  htmlFor="mobile-chapter-select"
                  className="block text-xs font-bold uppercase tracking-wider theme-gold"
                >
                  Select Chapter ({sortedBookEntries.length} Books)
                </label>
                <select
                  id="mobile-chapter-select"
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(Number(e.target.value));
                    setFilterQuery("");
                    setSearchError("");
                  }}
                  className="theme-input w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border border-theme"
                >
                  {sortedBookEntries.map(([num, name]) => (
                    <option key={num} value={num}>
                      {num}. {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Chapter Sidebar */}
              <aside className="hidden lg:block lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider theme-gold flex items-center gap-1.5">
                    <RiBookOpenLine size={16} />
                    <span>Chapters</span>
                  </span>
                  <span className="text-[10px] theme-subtle font-mono">
                    {sortedBookEntries.length} Books
                  </span>
                </div>

                <div className="max-h-[620px] overflow-y-auto space-y-1 pr-1 border border-theme rounded-2xl p-2 bg-theme-card/60 divide-y divide-theme/30">
                  {sortedBookEntries.length === 0 ? (
                    <div className="p-6 text-center text-xs theme-muted">
                      Loading chapters...
                    </div>
                  ) : (
                    sortedBookEntries.map(([num, name]) => {
                      const isSelected = selectedBook === Number(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setSelectedBook(Number(num));
                            setFilterQuery("");
                            setSearchError("");
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-accent-soft text-accent font-bold"
                              : "theme-text hover:bg-theme-soft"
                          }`}
                        >
                          <span className="truncate pr-2">
                            {num}. {name}
                          </span>
                          {isSelected && (
                            <span className="text-accent font-black">●</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Hadiths Feed */}
              <div className="lg:col-span-3">
                {/* Authenticity & Verification Notice */}
                <div className="bg-gold-soft border border-theme rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
                  <RiShieldCheckLine
                    size={18}
                    className="theme-gold shrink-0 mt-0.5"
                  />
                  <div className="text-xs theme-secondary leading-relaxed">
                    <strong className="theme-text font-bold">
                      {currentEdition.name} ({currentEdition.authenticityStatus}):{" "}
                    </strong>
                    {currentEdition.defaultGrade
                      ? "All narrations in this collection are universally recognized as Sahih (authentic) by classical Hadith scholarship."
                      : "This Sunan collection contains Sahih, Hasan, and Da'if narrations. Verify the scholar grading badge on each Hadith before citing."}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-theme/60">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold theme-text">
                      Book {selectedBook}:{" "}
                      {books[selectedBook] || "Selected Chapter"}
                    </h2>
                    <p className="text-xs theme-muted mt-0.5">
                      {currentEdition.name} • Showing {displayedHadiths.length}{" "}
                      Hadiths
                    </p>
                  </div>

                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterQuery("");
                        setSearchQuery("");
                      }}
                      className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      Clear filter &ldquo;{filterQuery}&rdquo;
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="theme-card p-12 sm:p-16 flex flex-col items-center justify-center gap-3">
                    <RiLoader4Line
                      size={36}
                      className="theme-accent animate-spin"
                    />
                    <p className="text-xs uppercase tracking-[0.2em] theme-subtle font-bold text-center">
                      Loading Authentic Arabic, English &amp; Urdu Text...
                    </p>
                  </div>
                ) : displayedHadiths.length === 0 ? (
                  <div className="theme-card p-10 sm:p-12 text-center border-dashed">
                    <p className="text-base font-bold theme-text">
                      No Hadiths found in this section
                    </p>
                    <p className="text-xs theme-muted mt-1">
                      Try another keyword, clear your search filter, or pick another
                      chapter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {displayedHadiths.map((h) => {
                      const isBookmarked = savedHadiths.some(
                        (item) => item.id === h.id
                      );
                      return (
                        <HadithCard
                          key={h.id}
                          hadith={h}
                          onSelect={setActiveHadith}
                          isBookmarked={isBookmarked}
                          onToggleBookmark={() => handleBookmarkToggle(h)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BOOKMARKS TAB VIEW */
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-theme/60">
                <div>
                  <h2 className="text-base sm:text-lg font-bold theme-text">
                    Your Saved Hadiths ({savedHadiths.length})
                  </h2>
                  <p className="text-xs theme-muted mt-0.5">
                    Hadiths saved to your personal sanctuary for reflection and
                    contemplation.
                  </p>
                </div>
              </div>

              {savedHadiths.length === 0 ? (
                <div className="theme-card p-12 sm:p-16 text-center border-dashed">
                  <RiBookmarkLine
                    size={36}
                    className="theme-subtle mx-auto mb-2"
                  />
                  <p className="text-base font-bold theme-text">
                    No Bookmarked Hadiths Yet
                  </p>
                  <p className="text-xs theme-muted mt-1">
                    Click the bookmark icon on any Hadith while reading to save it
                    here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode("browse")}
                    className="theme-button mt-4 !py-2 text-xs cursor-pointer"
                  >
                    Browse Hadith Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedHadiths.map((h) => (
                    <HadithCard
                      key={h.id}
                      hadith={h}
                      onSelect={setActiveHadith}
                      isBookmarked={true}
                      onToggleBookmark={() => handleBookmarkToggle(h)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Reader Drawer */}
      <HadithDetailDrawer
        hadith={activeHadith}
        onClose={() => setActiveHadith(null)}
        isBookmarked={isActiveHadithBookmarked}
        onToggleBookmark={() => handleBookmarkToggle(activeHadith)}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        itemName="Hadith"
      />

      <Footer />
    </div>
  );
};

export default HadithPage;