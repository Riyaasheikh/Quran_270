import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiSettings4Line,
  RiLoader4Line
} from '@remixicon/react';
import { 
  fetchSurahVerses, fetchChapterDetail, fetchChapters, fetchVerseAudioList, fetchVersesByPage, juzList 
} from '../api/quranApi';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';

import Navbar from '../components/global/Navbar';
import Footer from '../components/global/Footer';
import SurahIntro from '../components/surah/SurahIntro';
import AudioPlayer from '../components/audio/AudioPlayer';
import TranslationManager from '../ui/TranslationManager';
import SurahDropDown from '../components/surah/SurahDropDown';
import SurahControls from '../components/surah/SurahControls';
import VerseCard from '../components/surah/VerseCard';
import TafsirDrawer from '../components/surah/TafsirDrawer';
import HadithDrawer from '../components/surah/HadithDrawer';
import HadithDetailDrawer from '../components/hadith/HadithDetailDrawer';
import ReciterSelector from '../components/surah/ReciterSelector';
import QuranLinkerPopup from '../components/surah/QuranLinkerPopup';

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

const SurahDetail = () => {
  const { surahId, verseNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme, themes } = useTheme();
  const saveTimeoutRef = useRef(null);
  const verseSettleTimeoutRef = useRef(null);

  // Remembers which deep link (e.g. "2:153") has already been scrolled to,
  // so a translation change does not scroll the reader back to it.
  const handledDeepLink = useRef(null);
  const [detailHadith, setDetailHadith] = useState(null);

  const [verses, setVerses] = useState([]);
  const [chapterData, setChapterData] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioList, setAudioList] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [playMode, setPlayMode] = useState('continuous'); 
  
  const [viewMode, setViewMode] = useState('verse');
  const [currentPage, setCurrentPage] = useState(1);
  const [mushafVerses, setMushafVerses] = useState([]);
  const [mushafLoading, setMushafLoading] = useState(false);
  const [fontScale, setFontScale] = useState('normal'); 
  const [juzDrawerOpen, setJuzDrawerOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const [isTransOpen, setIsTransOpen] = useState(false);
  const [isReciterOpen, setIsReciterOpen] = useState(false);
  const [translation, setTranslation] = useState({ id: "85", name: "M.A.S. Abdel Haleem" });
  const [selectedReciter, setSelectedReciter] = useState({ id: 7, reciter_name: 'Mishary Rashid Alafasy' });
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [tafsirVerse, setTafsirVerse] = useState(null);
  const [hadithVerse, setHadithVerse] = useState(null);

  // Settled verse key so fast scrolling doesn't cause rapid card/link flicker
  const [activeVerseKey, setActiveVerseKey] = useState(null);
  const [linkerOpen, setLinkerOpen] = useState(false);

  const activeJuz = mushafVerses[0]?.juz_number || 1;
  const activeThemeObj = themes.find((t) => t.id === theme) || themes[0];

  /* ------------------------------------------------------------------ */
  /* Data loading                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!user) return;
    api.get('/api/bookmarks')
      .then(res => setUserBookmarks(res.data || []))
      .catch(() => {});
  }, [user]);

  // New surah: forget the previous deep link and reading position
  useEffect(() => {
    handledDeepLink.current = null;
    if (verseSettleTimeoutRef.current) clearTimeout(verseSettleTimeoutRef.current);
    setActiveVerseKey(null);
  }, [surahId]);

  useEffect(() => {
    return () => {
      if (verseSettleTimeoutRef.current) clearTimeout(verseSettleTimeoutRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!surahId || isNaN(surahId)) return;
    setLoading(true);
    
    Promise.all([
      fetchSurahVerses(surahId, translation.id),
      fetchChapterDetail(surahId),
      fetchChapters()
    ]).then(([versesData, infoData, chaptersData]) => {
      setVerses(versesData || []);
      setChapterData(infoData);
      setAllChapters(chaptersData || []);
      
      if (versesData && versesData.length > 0 && versesData[0].page_number) {
        setCurrentPage(versesData[0].page_number);
      }
    })
    .catch(err => console.error("Error loading Surah detail pipeline:", err))
    .finally(() => setLoading(false));
  }, [surahId, translation.id]);

  useEffect(() => {
    if (viewMode !== 'mushaf') return;
    setMushafLoading(true);
    fetchVersesByPage(currentPage)
      .then((data) => {
        setMushafVerses(data || []);
        setMushafLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load page:", err);
        setMushafLoading(false);
      });
  }, [currentPage, viewMode]);

  /* ------------------------------------------------------------------ */
  /* Mushaf navigation                                                  */
  /* ------------------------------------------------------------------ */

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => (p < 604 ? p + 1 : p));
  }, []);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  useEffect(() => {
    if (viewMode !== 'mushaf') return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToNextPage();
      if (e.key === "ArrowRight") goToPrevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, goToNextPage, goToPrevPage]);

  const handleSelectJuz = (juzNumber) => {
    const startPage = JUZ_START_PAGES[juzNumber - 1] || 1;
    setCurrentPage(startPage);
    setJuzDrawerOpen(false);
  };

  /* ------------------------------------------------------------------ */
  /* Reading position + linker popup                                    */
  /* ------------------------------------------------------------------ */

  const scrollToVerse = useCallback((verseNum) => {
    const el = document.getElementById(`verse-${verseNum}`);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 2500);
    return true;
  }, []);

  // Used by the Linker popup: scroll within this surah, or open another surah at that verse
  const handleSelectVerse = useCallback((verseKey) => {
    const [targetSurah, targetVerse] = String(verseKey).split(':');
    if (!targetSurah || !targetVerse) return;

    if (targetSurah === String(surahId)) {
      scrollToVerse(targetVerse);
    } else {
      navigate(`/surah/${targetSurah}/${targetVerse}`);
    }
  }, [surahId, navigate, scrollToVerse]);

  // Deep link: /surah/:surahId/:verseNumber scrolls to that verse once
  useEffect(() => {
    if (loading || viewMode !== 'verse' || !verseNumber || verses.length === 0) return;

    const key = `${surahId}:${verseNumber}`;
    if (handledDeepLink.current === key) return;

    const timer = setTimeout(() => {
      if (scrollToVerse(verseNumber)) handledDeepLink.current = key;
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, viewMode, verses, verseNumber, surahId, scrollToVerse]);

  // Track the verse near the reading line with a short settle delay to prevent scroll flicker
  useEffect(() => {
    if (loading || viewMode !== 'verse' || verses.length === 0) return;

    const inBand = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const n = Number(entry.target.getAttribute('data-verse-number'));
          if (entry.isIntersecting) inBand.add(n);
          else inBand.delete(n);
        });

        if (inBand.size === 0) return;

        const targetNum = Math.min(...inBand);
        const current = verses.find((v) => v.verse_number === targetNum);
        if (!current) return;

        if (verseSettleTimeoutRef.current) {
          clearTimeout(verseSettleTimeoutRef.current);
        }

        verseSettleTimeoutRef.current = setTimeout(() => {
          setActiveVerseKey((prev) => (prev === current.verse_key ? prev : current.verse_key));
        }, 180);
      },
      { rootMargin: '-32% 0px -52% 0px', threshold: 0 }
    );

    document.querySelectorAll('.verse-card').forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      if (verseSettleTimeoutRef.current) clearTimeout(verseSettleTimeoutRef.current);
    };
  }, [loading, viewMode, verses]);

  /* ------------------------------------------------------------------ */
  /* Audio                                                              */
  /* ------------------------------------------------------------------ */

  const handlePlayAudio = async (startVerseKey = null, reciterOverride = null) => {
    try {
      const reciterId = reciterOverride?.id || selectedReciter?.id || 7;
      const audioData = await fetchVerseAudioList(reciterId, surahId);

      if (!audioData || audioData.length === 0) {
        console.warn("No audio files returned for this reciter/surah.");
        return;
      }

      setAudioList(audioData);

      if (startVerseKey) {
        const idx = audioData.findIndex((a) => a.verse_key === startVerseKey);
        setCurrentAudioIndex(idx !== -1 ? idx : 0);
        setPlayMode("single");
      } else {
        setCurrentAudioIndex(0);
        setPlayMode("continuous");
      }

      setIsAudioOpen(true);
    } catch (e) {
      console.error("Audio stream system interface runtime fault:", e);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render (all hooks are above this line)                             */
  /* ------------------------------------------------------------------ */

  if (loading || !chapterData) {
    return (
      <div className="theme-page h-screen w-full flex flex-col items-center justify-center gap-3">
        <RiLoader4Line size={36} className="theme-accent animate-spin" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] theme-subtle">
          Loading Sanctuary...
        </span>
      </div>
    );
  }

  const quranSizeClass =
    fontScale === "sm" ? "quran-text-sm" : fontScale === "lg" ? "quran-text-lg" : "";

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        <header className="sticky top-[72px] md:top-[80px] z-30 border-b border-theme bg-theme-overlay backdrop-blur-md px-4 md:px-8 py-3 transition-colors duration-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <SurahDropDown currentSurah={chapterData} allChapters={allChapters} />
            
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="flex p-1 rounded-xl border border-theme bg-theme-soft" role="tablist">
                <button 
                  role="tab"
                  aria-selected={viewMode === 'verse'}
                  onClick={() => setViewMode('verse')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    viewMode === 'verse' 
                      ? 'bg-theme-card theme-text shadow-xs font-extrabold' 
                      : 'theme-muted hover:theme-text'
                  }`}
                >
                  Verse
                </button>
                <button 
                  role="tab"
                  aria-selected={viewMode === 'mushaf'}
                  onClick={() => {
                    setViewMode('mushaf');
                    if (verses[0]?.page_number) setCurrentPage(verses[0].page_number);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    viewMode === 'mushaf' 
                      ? 'bg-theme-card theme-text shadow-xs font-extrabold' 
                      : 'theme-muted hover:theme-text'
                  }`}
                >
                  Mushaf
                </button>
              </div>

              <button 
                onClick={() => setIsReciterOpen(true)}
                className="theme-icon-button theme-icon-button-sm cursor-pointer"
                title="Select Reciter"
              >
                <RiSettings4Line size={18} />
              </button>
            </div>
          </div>
        </header>

        {viewMode === 'verse' ? (
          <main
            className={`transition-opacity duration-200 ${
              linkerOpen ? 'xl:pe-[25rem]' : ''
            }`}
          >
            <SurahControls 
              onPlay={() => handlePlayAudio()} 
              translation={translation} 
              onOpenTranslation={() => setIsTransOpen(true)} 
            />

            <SurahIntro chapter={chapterData} />

            <div className="reading-column px-4 md:px-6 pb-24 space-y-4">
              {verses.map(v => (
                <div 
                  key={v.id || v.verse_key} 
                  id={`verse-${v.verse_number}`} 
                  data-verse-number={v.verse_number} 
                  className="verse-card ayah group"
                >
                  <VerseCard 
                    verse={v} 
                    translationId={translation.id}
                    isBookmarked={userBookmarks.includes(v.verse_key)}
                    onPlay={() => handlePlayAudio(v.verse_key)} 
                    onTafsir={setTafsirVerse}
                    onHadith={setHadithVerse}
                    onBookmarkToggle={(added) => {
                      setUserBookmarks(prev => 
                        added ? [...prev, v.verse_key] : prev.filter(k => k !== v.verse_key)
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </main>
        ) : (
          <div className="theme-page py-6 px-4 sm:px-6 flex flex-col items-center">
            <div className="theme-glass w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-5 px-4 sm:px-6 py-3 rounded-full sticky top-24 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setJuzDrawerOpen((o) => !o);
                    setThemeMenuOpen(false);
                  }}
                  className="theme-button !min-h-[2.25rem] !px-4 !rounded-full text-xs cursor-pointer"
                >
                  <span>Juz {activeJuz} of 30</span>
                  <span>▾</span>
                </button>
                <span className="theme-badge hidden md:inline-flex">
                  Page {currentPage} / 604
                </span>
              </div>

              <div className="flex items-center gap-2">
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
                        fontScale === sz.id ? "bg-accent text-white" : "theme-muted hover:theme-text"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {juzDrawerOpen && (
              <div className="theme-card theme-card-static w-full max-w-5xl mb-6 p-5 z-20">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="theme-badge-gold theme-badge">Juz 1 – 30</span>
                    <span className="text-xs theme-muted">Select any Juz to jump directly</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJuzDrawerOpen(false)}
                    className="theme-button-ghost !min-h-[2rem] !px-2.5 text-xs cursor-pointer"
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
                          isCurrent ? "bg-accent border-accent shadow-sm" : "bg-theme-soft border-theme theme-text hover:border-accent"
                        }`}
                      >
                        {juz.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <main className="reading-surface relative overflow-hidden w-full max-w-5xl">
              <div className="p-6 sm:p-10 lg:p-12 min-h-[72vh] flex flex-col justify-between">
                {mushafLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <p className="text-sm theme-muted font-medium">Opening Page {currentPage}...</p>
                  </div>
                ) : (
                  <div className="reading-column flex-1 flex flex-col justify-center">
                    <div className="bg-theme-soft/50 border-2 border-gold/40 rounded-2xl p-6 sm:p-10">
                      <div className="flex items-center justify-between text-xs font-bold theme-gold pb-4 mb-6 border-b border-theme">
                        <span>Juz {activeJuz}</span>
                        <span className="font-arabic text-base">القرآن الكريم</span>
                        <span>Page {currentPage}</span>
                      </div>

                      <div
                        dir="rtl"
                        lang="ar"
                        style={{ textAlignLast: "center" }}
                        className={`font-quran ${quranSizeClass} !text-justify`}
                      >
                        {mushafVerses.map((v) => {
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
                )}

                <div className="mt-10 pt-5 border-t border-theme flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={currentPage >= 604}
                    className="theme-button !rounded-full text-xs sm:text-sm cursor-pointer"
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
                    className="theme-button-outline !rounded-full text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Previous Page</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>

      {/* Linker popup: smoothly follows the settled verse near the reading line */}
      {viewMode === 'verse' && activeVerseKey && (
        <QuranLinkerPopup
          verseKey={activeVerseKey}
          onSelectVerse={handleSelectVerse}
          raised={isAudioOpen}
          onOpenChange={setLinkerOpen}
        />
      )}

      {isAudioOpen && (
        <AudioPlayer 
          playlist={audioList}
          currentIndex={currentAudioIndex}
          surahName={chapterData.name_simple}
          reciterName={selectedReciter.reciter_name || selectedReciter.name}
          isSingleVerseMode={playMode === 'single'}
          onClose={() => setIsAudioOpen(false)}
          onChangeReciter={() => setIsReciterOpen(true)}
          onNext={() => setCurrentAudioIndex(p => (p + 1) % audioList.length)}
          onPrevious={() => setCurrentAudioIndex(p => (p - 1 + audioList.length) % audioList.length)}
        />
      )}

      {isReciterOpen && (
        <ReciterSelector
          selectedId={selectedReciter.id}
          onSelect={(rec) => {
            setSelectedReciter(rec);
            setIsReciterOpen(false);
            if (isAudioOpen) {
              const activeKey =
                playMode === "single" ? audioList[currentAudioIndex]?.verse_key : null;
              handlePlayAudio(activeKey, rec);
            }
          }}
          onClose={() => setIsReciterOpen(false)}
        />
      )}

      <TranslationManager 
        isOpen={isTransOpen} 
        onClose={() => setIsTransOpen(false)} 
        selectedId={translation.id}
        onSelect={(t) => setTranslation({ id: t.id.toString(), name: t.author_name })}
      />

      {tafsirVerse && <TafsirDrawer verse={tafsirVerse} onClose={() => setTafsirVerse(null)} />}
      {hadithVerse && (
        <HadithDrawer
          verse={hadithVerse}
          onClose={() => setHadithVerse(null)}
          onOpenHadithDetail={(h) => setDetailHadith(h)}
        />
      )}

      {detailHadith && (
        <HadithDetailDrawer
          hadith={detailHadith}
          onClose={() => setDetailHadith(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default SurahDetail;