import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  RiSearchLine,
  RiSparklingFill,
  RiBookOpenLine,
  RiCloseLine,
  RiLoader4Line,
  RiBookmarkFill,
  RiBookmarkLine,
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

const HadithPage = () => {
  const { user } = useContext(AuthContext);
  const { getSavedItems, toggleBookmark } = useBookmarks("deen360_saved_hadiths");

  const [selectedCollection, setSelectedCollection] = useState("bukhari");
  const [books, setBooks] = useState({});
  const [selectedBook, setSelectedBook] = useState(1);
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHadith, setActiveHadith] = useState(null);

  // Tab mode: 'browse' | 'bookmarks'
  const [viewMode, setViewMode] = useState("browse");

  // Auth gate modal & bookmarked list
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedHadiths, setSavedHadiths] = useState([]);

  // Sync user's saved items whenever user session or view changes
  useEffect(() => {
    setSavedHadiths(getSavedItems());
  }, [user, viewMode]);

  // Auth-guarded toggle
  const handleBookmarkToggle = (hadithObj) => {
    if (!hadithObj) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const updated = toggleBookmark(hadithObj, () => setIsAuthModalOpen(true));
    if (updated) {
      setSavedHadiths(updated);
    }
  };

  // 1. Fetch collection chapters / books
  useEffect(() => {
    if (viewMode === "bookmarks") return;
    let isMounted = true;
    setLoading(true);

    fetchCollectionBooks(selectedCollection)
      .then((data) => {
        if (!isMounted) return;
        setBooks(data);

        const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
        if (keys.length > 0) {
          setSelectedBook(keys[0]);
        }
      })
      .catch((err) => console.error("Chapters fetch error:", err))
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

    fetchHadithsByBook(selectedCollection, selectedBook)
      .then((data) => {
        if (!isMounted) return;
        setHadiths(data);
      })
      .catch((err) => console.error("Hadiths fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCollection, selectedBook, viewMode]);

  // Direct Number or Chapter Search
  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const q = searchQuery.trim();
      if (!q) return;

      // Case A: Exact Hadith Number Lookup
      if (!isNaN(q)) {
        try {
          setLoading(true);
          const result = await fetchSingleHadith(selectedCollection, Number(q));
          setHadiths([result]);
        } catch {
          alert(`Hadith #${q} not found in ${HADITH_EDITIONS[selectedCollection].name}`);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Case B: Search matches a known chapter title
      const found = Object.entries(books).find(([_, name]) =>
        name.toLowerCase().includes(q.toLowerCase())
      );
      if (found) {
        setSelectedBook(Number(found[0]));
      }
    }
  };

  // Filter Hadiths by active query
  const displayedHadiths = useMemo(() => {
    const sourceList = viewMode === "bookmarks" ? savedHadiths : hadiths;
    const q = searchQuery.toLowerCase().trim();
    if (!q || !isNaN(q)) return sourceList;

    return sourceList.filter(
      (h) =>
        h.english?.toLowerCase().includes(q) ||
        h.urdu?.includes(q) ||
        h.arabic?.includes(q) ||
        String(h.hadithNumber).includes(q)
    );
  }, [viewMode, savedHadiths, hadiths, searchQuery]);

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay py-12 px-4 sm:px-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
              <RiSparklingFill size={13} />
              <span>Canonical Sunnah Library</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              The Comprehensive Hadith Corpus
            </h1>
            <p className="theme-muted text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Explore authentic Hadiths across the Kutub al-Sittah with complete Arabic, English, and Urdu translations.
            </p>

            {/* View Mode Toggle (Browse vs Bookmarks) */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setViewMode("browse")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "bookmarks"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiBookmarkFill size={15} />
                <span>Saved Bookmarks ({savedHadiths.length})</span>
              </button>
            </div>

            {/* Collection Switcher Buttons (Active in Browse mode) */}
            {viewMode === "browse" && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {Object.values(HADITH_EDITIONS).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setSelectedCollection(col.id);
                      setSearchQuery("");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            <div className="relative max-w-2xl mx-auto mt-6">
              <RiSearchLine
                size={20}
                className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 theme-subtle"
              />
              <input
                type="text"
                placeholder='Search keywords in English or Urdu, or type a number & press Enter...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="theme-input !py-3.5 ltr:pl-12 rtl:pr-24 text-sm rounded-2xl shadow-lg border border-theme"
              />

              <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="theme-icon-button theme-icon-button-sm mr-1 cursor-pointer"
                  >
                    <RiCloseLine size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="theme-button !py-1.5 !px-3 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick Topic Pills */}
            {viewMode === "browse" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                <span className="text-[11px] theme-subtle font-medium mr-1">Quick Topics:</span>
                {POPULAR_SEARCHES.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setSearchQuery(topic);
                      const found = Object.entries(books).find(([_, name]) =>
                        name.toLowerCase().includes(topic.toLowerCase())
                      );
                      if (found) setSelectedBook(Number(found[0]));
                    }}
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {viewMode === "browse" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Chapters Navigation */}
              <aside className="lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider theme-gold flex items-center gap-1.5">
                    <RiBookOpenLine size={16} />
                    <span>Chapters</span>
                  </span>
                  <span className="text-[10px] theme-subtle font-mono">
                    {Object.keys(books).length} Books
                  </span>
                </div>

                <div className="max-h-[600px] overflow-y-auto space-y-1 pr-1 border border-theme rounded-2xl p-2 bg-theme-card/60 divide-y divide-theme/30">
                  {Object.keys(books).length === 0 ? (
                    <div className="p-6 text-center text-xs theme-muted">
                      Loading chapters...
                    </div>
                  ) : (
                    Object.entries(books).map(([num, name]) => {
                      const isSelected = selectedBook === Number(num);
                      const isMatchedBySearch =
                        searchQuery.trim() !== "" &&
                        name.toLowerCase().includes(searchQuery.toLowerCase().trim());

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setSelectedBook(Number(num));
                            setSearchQuery("");
                          }}
                          className={`w-full text-left rtl:text-right p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-accent-soft text-accent font-bold"
                              : isMatchedBySearch
                              ? "bg-theme-soft text-theme font-semibold border border-accent/30"
                              : "theme-text hover:bg-theme-soft"
                          }`}
                        >
                          <span className="truncate pr-2">
                            {num}. {name}
                          </span>
                          {isSelected && <span className="text-accent font-black">●</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Hadiths Stream */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-theme/60">
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Book {selectedBook}: {books[selectedBook] || "Selected Chapter"}
                    </h2>
                    <p className="text-xs theme-muted mt-0.5">
                      {HADITH_EDITIONS[selectedCollection].name} • Showing{" "}
                      {displayedHadiths.length} Hadiths
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="theme-card p-16 flex flex-col items-center justify-center gap-3">
                    <RiLoader4Line size={36} className="theme-accent animate-spin" />
                    <p className="text-xs uppercase tracking-[0.25em] theme-subtle font-bold">
                      Loading Authentic Arabic, English & Urdu Text...
                    </p>
                  </div>
                ) : displayedHadiths.length === 0 ? (
                  <div className="theme-card p-12 text-center border-dashed">
                    <p className="text-base font-bold theme-text">
                      No Hadiths found in this section
                    </p>
                    <p className="text-xs theme-muted mt-1">
                      Try another keyword or select a different chapter from the sidebar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {displayedHadiths.map((h) => {
                      const isBookmarked = savedHadiths.some((item) => item.id === h.id);
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
                  <h2 className="text-lg font-bold theme-text">
                    Your Saved Hadiths ({savedHadiths.length})
                  </h2>
                  <p className="text-xs theme-muted mt-0.5">
                    Hadiths saved to your personal sanctuary for reflection and contemplation.
                  </p>
                </div>
              </div>

              {savedHadiths.length === 0 ? (
                <div className="theme-card p-16 text-center border-dashed">
                  <RiBookmarkLine size={36} className="theme-subtle mx-auto mb-2" />
                  <p className="text-base font-bold theme-text">No Bookmarked Hadiths Yet</p>
                  <p className="text-xs theme-muted mt-1">
                    Click the bookmark icon on any Hadith while reading to save it here.
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
        isBookmarked={activeHadith && savedHadiths.some((item) => item.id === activeHadith.id)}
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