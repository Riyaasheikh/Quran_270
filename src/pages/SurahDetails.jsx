import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  RiSettings4Line,
  RiLoader4Line
} from '@remixicon/react';
import { 
  fetchSurahVerses, fetchChapterDetail, fetchChapters, fetchVerseAudioList 
} from '../api/quranApi';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/axios';

import Navbar from '../components/global/Navbar';
import Footer from '../components/global/Footer';
import SurahIntro from '../components/surah/SurahIntro';
import AudioPlayer from '../components/audio/AudioPlayer';
import TranslationManager from '../ui/TranslationManager';
import QuranViewer from '../ui/QuranViewer';
import SurahDropDown from '../components/surah/SurahDropDown';
import SurahControls from '../components/surah/SurahControls';
import VerseCard from '../components/surah/VerseCard';
import TafsirDrawer from '../components/surah/TafsirDrawer';
import HadithDrawer from '../components/surah/HadithDrawer';
import ReciterSelector from '../components/surah/ReciterSelector';

const SurahDetail = () => {
  const { surahId, verseNumber } = useParams();
  const { user } = useContext(AuthContext);
  const saveTimeoutRef = useRef(null);

  const [verses, setVerses] = useState([]);
  const [chapterData, setChapterData] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioList, setAudioList] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [playMode, setPlayMode] = useState('continuous'); 
  const [viewMode, setViewMode] = useState('verse');
  const [isTransOpen, setIsTransOpen] = useState(false);
  const [isReciterOpen, setIsReciterOpen] = useState(false);
  const [translation, setTranslation] = useState({ id: "85", name: "M.A.S. Abdel Haleem" });
  const [selectedReciter, setSelectedReciter] = useState({ id: 7, reciter_name: 'Mishary Rashid Alafasy' });
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [tafsirVerse, setTafsirVerse] = useState(null);
  const [hadithVerse, setHadithVerse] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/api/bookmarks')
      .then(res => setUserBookmarks(res.data || []))
      .catch(() => {});
  }, [user]);

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
    })
    .catch(err => console.error("Error loading Surah detail pipeline:", err))
    .finally(() => setLoading(false));
  }, [surahId, translation.id]);

  const saveProgress = async (verse) => {
    if (!user || !chapterData) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post('/api/last-read', {
          surah_id: parseInt(surahId),
          surah_name: chapterData.name_simple,
          surah_name_arabic: chapterData.name_arabic,
          verse_number: verse.verse_number,
          verse_key: verse.verse_key
        });
      } catch (err) {
        console.error("Failed to safely stream user reading index node:", err);
      }
    }, 1200); 
  };

  useEffect(() => {
    if (verseNumber && verses.length > 0) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`verse-${verseNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('active');
          setTimeout(() => element.classList.remove('active'), 2500);
        }
      }, 500);

      return () => clearTimeout(scrollTimer);
    }
  }, [verses, verseNumber]);

  useEffect(() => {
    if (!user || verses.length === 0 || viewMode !== 'verse') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const vNumber = entry.target.getAttribute('data-verse-number');
            const verse = verses.find(v => v.verse_number === parseInt(vNumber));
            if (verse) saveProgress(verse);
          }
        });
      },
      { threshold: 0.55 } 
    );

    const cards = document.querySelectorAll('.verse-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [verses, user, viewMode, chapterData]);

  const handlePlayAudio = async (startVerseKey = null) => {
    try {
      const audioData = await fetchVerseAudioList(selectedReciter.id, surahId);
      setAudioList(audioData);
      
      if (startVerseKey) {
        const idx = audioData.findIndex(a => a.verse_key === startVerseKey);
        setCurrentAudioIndex(idx !== -1 ? idx : 0);
        setPlayMode('single');
        
        const currentVerse = verses.find(v => v.verse_key === startVerseKey);
        if (currentVerse) saveProgress(currentVerse);
      } else {
        setCurrentAudioIndex(0);
        setPlayMode('continuous');
        if (verses.length > 0) saveProgress(verses[0]);
      }
      
      setIsAudioOpen(true);
    } catch (e) {
      console.error('Audio stream system interface runtime fault:', e);
    }
  };

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

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Sticky Controller Toolbar with Blur and Backdrop Tint */}
        <header className="sticky top-[72px] md:top-[80px] z-30 border-b border-theme bg-theme-overlay backdrop-blur-md px-4 md:px-8 py-3 transition-colors duration-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <SurahDropDown currentSurah={chapterData} allChapters={allChapters} />
            
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Capsule View Switcher */}
              <div 
                className="flex p-1 rounded-xl border border-theme bg-theme-soft"
                role="tablist"
                aria-label="Reading presentation modes"
              >
                <button 
                  role="tab"
                  aria-selected={viewMode === 'verse'}
                  onClick={() => setViewMode('verse')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    viewMode === 'verse' 
                      ? 'bg-theme-card theme-text shadow-xs font-extrabold' 
                      : 'theme-muted hover:theme-text'
                  }`}
                >
                  Verse
                </button>
                <button 
                  role="tab"
                  aria-selected={viewMode === 'reading'}
                  onClick={() => setViewMode('reading')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    viewMode === 'reading' 
                      ? 'bg-theme-card theme-text shadow-xs font-extrabold' 
                      : 'theme-muted hover:theme-text'
                  }`}
                >
                  Mushaf
                </button>
              </div>

              {/* Reciter / Audio Settings Trigger */}
              <button 
                onClick={() => setIsReciterOpen(true)}
                className="theme-icon-button theme-icon-button-sm"
                aria-label="Reciter & audio settings"
                title="Select Reciter"
              >
                <RiSettings4Line size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* View Switcher Main Container */}
        {viewMode === 'verse' ? (
          <main className="animate-in fade-in duration-300">
            {/* Audio Listen Bar & Translation Selector */}
            <SurahControls 
              onPlay={() => handlePlayAudio()} 
              translation={translation} 
              onOpenTranslation={() => setIsTransOpen(true)} 
            />

            {/* Surah Name & Chapter Overview */}
            <SurahIntro chapter={chapterData} />

            {/* Verses Container */}
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
          <main className="reading-surface max-w-5xl mx-auto my-8 p-4 sm:p-8 animate-in fade-in duration-300">
            <QuranViewer initialPage={verses[0]?.page_number} />
          </main>
        )}
      </div>

      {/* Drawers & Modals */}
      {isAudioOpen && (
        <AudioPlayer 
          playlist={audioList}
          currentIndex={currentAudioIndex}
          surahName={chapterData.name_simple}
          reciterName={selectedReciter.reciter_name || selectedReciter.name}
          isSingleVerseMode={playMode === 'single'}
          onClose={() => setIsAudioOpen(false)}
          onNext={() => setCurrentAudioIndex(p => (p + 1) % audioList.length)}
          onPrevious={() => setCurrentAudioIndex(p => (p - 1 + audioList.length) % audioList.length)}
        />
      )}

      {isReciterOpen && (
        <ReciterSelector 
          selectedId={selectedReciter.id} 
          onSelect={setSelectedReciter} 
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
      {hadithVerse && <HadithDrawer verse={hadithVerse} onClose={() => setHadithVerse(null)} />}

      <Footer />
    </div>
  );
};

export default SurahDetail;