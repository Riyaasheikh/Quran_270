import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  RiBookmarkFill, RiSettings4Line, RiListCheck, RiBookOpenLine 
} from '@remixicon/react';
import { 
  fetchSurahVerses, fetchChapterDetail, fetchChapters, fetchVerseAudioList 
} from '../api/quranApi';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/axios';

// UI Components
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

  // --- 1. CORE DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    api.get('/api/bookmarks').then(res => setUserBookmarks(res.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!surahId || isNaN(surahId)) return;
    setLoading(true);
    
    Promise.all([
      fetchSurahVerses(surahId, translation.id),
      fetchChapterDetail(surahId),
      fetchChapters()
    ]).then(([versesData, infoData, chaptersData]) => {
      setVerses(versesData);
      setChapterData(infoData);
      setAllChapters(chaptersData);
    })
    .catch(err => console.error("Error loading Surah:", err))
    .finally(() => setLoading(false));
  }, [surahId, translation.id]);

  // --- 2. PROGRESS TRACKING LOGIC ---
  const saveProgress = async (verse) => {
    if (!user || !chapterData) return;

    // Debouncing the API call to save server resources
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
        console.error("Failed to save reading progress", err);
      }
    }, 1000); // Wait for 1 second of "staying" on a verse before saving
  };

  // --- 3. AUTO-SCROLL TO VERSE ---
  useEffect(() => {
    if (verseNumber && verses.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`verse-${verseNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-teal-50/50');
          setTimeout(() => element.classList.remove('bg-teal-50/50'), 2000);
        }
      }, 800);
    }
  }, [verses, verseNumber]);

  // --- 4. INTERSECTION OBSERVER (Auto-track while scrolling) ---
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
      { threshold: 0.6 } // Trigger when 60% of the verse is visible
    );

    const cards = document.querySelectorAll('.verse-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [verses, user, viewMode, chapterData]);

  // --- 5. AUDIO & MANUAL PLAY TRACKING ---
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
      console.error('Audio error:', e);
    }
  };

  if (loading || !chapterData) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-[#1f2124] font-sans">
      <Navbar />

      <div className="sticky top-0 border-b bg-white/95 backdrop-blur-sm z-[80] px-4 md:px-10 py-3 flex items-center justify-between shadow-sm">
        <SurahDropDown currentSurah={chapterData} allChapters={allChapters} />
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('verse')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'verse' ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}
            >
              Verse
            </button>
            <button 
              onClick={() => setViewMode('reading')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'reading' ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}
            >
              Reading
            </button>
          </div>

          <button 
            onClick={() => setIsReciterOpen(true)}
            className="p-2.5 text-[#2ca4ab] hover:bg-[#2ca4ab]/10 rounded-full transition-all"
          >
            <RiSettings4Line size={24} />
          </button>
        </div>
      </div>

      {viewMode === 'verse' ? (
        <div className="animate-in fade-in duration-700">
          <SurahControls 
            onPlay={() => handlePlayAudio()} 
            translation={translation} 
            onOpenTranslation={() => setIsTransOpen(true)} 
          />

          <SurahIntro chapter={chapterData} />

          <div className="max-w-5xl mx-auto px-6 pb-32">
            {verses.map(v => (
              <div key={v.id} id={`verse-${v.verse_number}`} data-verse-number={v.verse_number} className="verse-card">
                <VerseCard 
                  verse={v} 
                  translationId={translation.id}
                  isBookmarked={userBookmarks.includes(v.verse_key)}
                  onPlay={() => handlePlayAudio(v.verse_key)} 
                  onTafsir={setTafsirVerse}
                  onHadith={setHadithVerse}
                  onBookmarkToggle={(added) => {
                    setUserBookmarks(prev => added ? [...prev, v.verse_key] : prev.filter(k => k !== v.verse_key));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <QuranViewer initialPage={verses[0]?.page_number} />
      )}

      {/* AudioPlayer, Modals, Footer remain same as your provided code */}
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