import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchVersesByPage, juzList } from "../api/quranApi";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

const STORAGE_KEY = "deen360_reading_progress";

export default function QuranBookReader() {
  const { theme, setTheme, themes } = useTheme();

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved?.page || 1;
    } catch {
      return 1;
    }
  });

  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("text"); // 'text' | 'mushaf'
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontScale, setFontScale] = useState("normal"); // 'sm' | 'normal' | 'lg'
  const [juzDrawerOpen, setJuzDrawerOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const activeJuz = verses[0]?.juz_number || 1;
  const activeThemeObj = themes.find((t) => t.id === theme) || themes[0];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchVersesByPage(currentPage)
      .then((data) => {
        if (!isMounted) return;
        setVerses(data);
        setLoading(false);

        const juzNum = data[0]?.juz_number || 1;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            page: currentPage,
            juz: juzNum,
            verseKey: data[0]?.verse_key || "1:1",
            updatedAt: Date.now(),
          })
        );
      })
      .catch((err) => {
        console.error("Failed to load page:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => (p < 604 ? p + 1 : p));
  }, []);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToNextPage();
      if (e.key === "ArrowRight") goToPrevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  const handleSelectJuz = (juzNumber) => {
    const startPage = JUZ_START_PAGES[juzNumber - 1] || 1;
    setCurrentPage(startPage);
    setJuzDrawerOpen(false);
  };

  const quranSizeClass =
    fontScale === "sm"
      ? "quran-text-sm"
      : fontScale === "lg"
      ? "quran-text-lg"
      : "";

  return (
    <div className="theme-page py-6 px-4 sm:px-6 flex flex-col items-center">
      <Navbar/>
      {/* Top Floating Control Bar */}
      <div className="theme-glass mt-2 lg:mt-6 w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 mb-5 px-4 sm:px-6 py-3 rounded-full sticky top-3 z-30">
        {/* Left: Home + Juz Selector + Page Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="theme-button-outline !min-h-[2.25rem] !px-3.5 !rounded-full text-xs flex items-center gap-1.5"
          >
            <span>←</span>
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setJuzDrawerOpen((o) => !o);
              setThemeMenuOpen(false);
            }}
            className="theme-button !min-h-[2.25rem] !px-4 !rounded-full text-xs"
          >
            <span>Juz {activeJuz} of 30</span>
            <span>▾</span>
          </button>

          <span className="theme-badge hidden md:inline-flex">
            Page {currentPage} / 604
          </span>
        </div>

        {/* Right: Font Scale + View Mode + Translation + Themes */}
        <div className="flex items-center gap-2">
          {/* Arabic Font Size Toggle */}
          <div className="hidden sm:flex items-center bg-theme-soft border border-theme rounded-full p-0.5">
            {[
              { id: "sm", label: "A-" },
              { id: "normal", label: "A" },
              { id: "lg", label: "A+" },
            ].map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => setFontScale(sz.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                  fontScale === sz.id
                    ? "bg-accent text-white"
                    : "theme-muted hover:theme-text"
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "text" ? "mushaf" : "text")}
            className="theme-button-outline !min-h-[2.25rem] !px-3.5 !rounded-full text-xs"
          >
            {viewMode === "text" ? "Mushaf View" : "Verse View"}
          </button>

          {viewMode === "text" && (
            <button
              type="button"
              onClick={() => setShowTranslation((s) => !s)}
              className={`${
                showTranslation ? "theme-button-gold" : "theme-button-outline"
              } !min-h-[2.25rem] !px-3.5 !rounded-full text-xs`}
            >
              Translation
            </button>
          )}

          {/* Theme Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setThemeMenuOpen((o) => !o);
                setJuzDrawerOpen(false);
              }}
              aria-label="Select Theme"
              className="theme-button-outline !min-h-[2.25rem] !px-3 !rounded-full text-xs flex items-center gap-2"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: activeThemeObj.dot }}
              />
              <span className="hidden md:inline">{activeThemeObj.name}</span>
              <span className="theme-muted">▾</span>
            </button>

            {themeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setThemeMenuOpen(false)}
                />
                <div className="theme-card theme-card-static absolute right-0 mt-2 w-48 p-1.5 z-50 shadow-xl">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider theme-muted">
                    Choose Theme
                  </div>
                  {themes.map((t) => {
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                          isSelected
                            ? "bg-accent-soft theme-accent"
                            : "theme-text hover:bg-theme-soft"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 flex items-center justify-center"
                            style={{ backgroundColor: t.previewBg }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: t.dot }}
                            />
                          </span>
                          {t.name}
                        </span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Juz 1–30 Quick-Jump Grid */}
      {juzDrawerOpen && (
        <div className="theme-card theme-card-static w-full max-w-5xl mb-6 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="theme-badge-gold theme-badge">Juz 1 – 30</span>
              <span className="text-xs theme-muted">
                Select any Juz to jump directly to its starting page
              </span>
            </div>
            <button
              type="button"
              onClick={() => setJuzDrawerOpen(false)}
              className="theme-button-ghost !min-h-[2rem] !px-2.5 text-xs"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {juzList.map((juz) => {
              const isCurrent = activeJuz === juz.id;
              return (
                <button
                  key={juz.id}
                  type="button"
                  onClick={() => handleSelectJuz(juz.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isCurrent
                      ? "bg-accent border-accent shadow-sm"
                      : "bg-theme-soft border-theme theme-text hover:border-accent"
                  }`}
                >
                  {juz.id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Book Reading Surface */}
      <main className="reading-surface relative overflow-hidden">
        {/* Subtle Center Book Spine Crease on Desktop */}
        <div
          aria-hidden="true"
          className="hidden lg:block pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(var(--shadow-color), 0.08), transparent)",
          }}
        />

        <div className="p-6 sm:p-10 lg:p-12 min-h-[72vh] flex flex-col justify-between">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-sm theme-muted font-medium">
                Opening Page {currentPage}...
              </p>
            </div>
          ) : viewMode === "mushaf" ? (
            /* Traditional Framed Mushaf Page View */
            <div className="reading-column flex-1 flex flex-col justify-center">
              <div className="bg-theme-soft/50 border-2 border-gold/40 rounded-2xl p-6 sm:p-10">
                {/* Ornate Mushaf Page Header */}
                <div className="flex items-center justify-between text-xs font-bold theme-gold pb-4 mb-6 border-b border-theme">
                  <span>Juz {activeJuz}</span>
                  <span className="font-arabic text-base">القرآن الكريم</span>
                  <span>Page {currentPage}</span>
                </div>

                {/* Justified Continuous Uthmani Text */}
                <div
                  dir="rtl"
                  lang="ar"
                  style={{ textAlignLast: "center" }}
                  className={`font-quran ${quranSizeClass} !text-justify`}
                >
                  {verses.map((v) => {
                    const [surahNum, ayahNum] = v.verse_key.split(":");
                    return (
                      <React.Fragment key={v.id}>
                        {ayahNum === "1" && (
                          <div className="my-6 py-3 px-4 rounded-xl bg-gold-soft border border-gold/40 text-center">
                            <span className="text-xs font-bold uppercase tracking-widest theme-gold block">
                              
                              Surah {surahNum}
                            </span>
                            {surahNum !== "1" && surahNum !== "9" && (
                              <div className="font-quran text-2xl sm:text-3xl !text-center mt-1">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                              </div>
                            )}
                          </div>
                        )}
                        <span>
                          {v.text_uthmani}{" "}
                          <span className="ayah-number mx-1 align-middle !text-gold border-gold/40">
                            {ayahNum}
                          </span>{" "}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Verse-by-Verse or Continuous Text View */
            <div className="reading-column">
              {!showTranslation ? (
                <div
                  dir="rtl"
                  lang="ar"
                  className={`font-quran ${quranSizeClass}`}
                >
                  {verses.map((v) => {
                    const [surahNum, ayahNum] = v.verse_key.split(":");
                    return (
                      <React.Fragment key={v.id}>
                        {ayahNum === "1" && (
                          <div className="my-6 py-3 px-4 rounded-xl bg-accent-soft border border-accent/30 text-center">
                            <span className="text-xs font-bold uppercase tracking-widest theme-accent block">
                              Surah {surahNum}
                            </span>
                            {surahNum !== "1" && surahNum !== "9" && (
                              <div className="font-quran text-2xl sm:text-3xl !text-center mt-1">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                              </div>
                            )}
                          </div>
                        )}
                        <span>
                          {v.text_uthmani}{" "}
                          <span className="ayah-number mx-1.5 align-middle">
                            {ayahNum}
                          </span>{" "}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {verses.map((v) => {
                    const [surahNum, ayahNum] = v.verse_key.split(":");
                    return (
                      <React.Fragment key={v.id}>
                        {ayahNum === "1" && (
                          <div className="my-4 py-3.5 px-5 rounded-2xl bg-gold-soft border border-gold/30 text-center">
                            <span className="text-xs font-bold uppercase tracking-widest theme-gold">
                              Surah {surahNum}
                            </span>
                            {surahNum !== "1" && surahNum !== "9" && (
                              <p
                                dir="rtl"
                                lang="ar"
                                className="font-quran text-2xl !text-center mt-1"
                              >
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                              </p>
                            )}
                          </div>
                        )}

                        <article className="ayah border border-transparent hover:border-theme">
                          <div className="flex items-center justify-between mb-3">
                            <span className="ayah-number">{v.verse_key}</span>
                            <span className="text-[11px] font-semibold theme-subtle">
                              Juz {v.juz_number}
                            </span>
                          </div>

                          <p
                            dir="rtl"
                            lang="ar"
                            className={`font-quran ${quranSizeClass} mb-4`}
                          >
                            {v.text_uthmani}
                          </p>

                          {v.translations?.[0] && (
                            <p
                              className="translation-text"
                              dangerouslySetInnerHTML={{
                                __html: v.translations[0].text,
                              }}
                            />
                          )}
                        </article>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Book Bottom Navigation Bar (RTL Book Flow: Next on Left, Prev on Right) */}
          <div className="mt-10 pt-5 border-t border-theme flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage >= 604}
              className="theme-button !rounded-full text-xs sm:text-sm"
            >
              <span>←</span>
              <span>Next Page</span>
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold tracking-widest uppercase theme-gold">
                Juz {activeJuz} • Page {currentPage}
              </span>
              <span className="text-[11px] theme-subtle hidden sm:inline">
                Use ← / → arrow keys to turn pages
              </span>
            </div>

            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="theme-button-outline !rounded-full text-xs sm:text-sm"
            >
              <span>Previous Page</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}