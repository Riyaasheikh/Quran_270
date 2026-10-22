import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiBookmarkFill, 
  RiDeleteBinLine, 
  RiLoader4Line, 
  RiArrowLeftLine,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiSearchLine
} from '@remixicon/react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/global/Footer';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/bookmarks' } });
      return;
    }

    let isMounted = true;
    api.get('/api/bookmarks/full')
      .then(res => {
        if (isMounted) setBookmarks(res.data || []);
      })
      .catch(err => console.error('Failed to fetch bookmarks:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const removeBookmark = async (e, verseKey) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDeletingKey(verseKey);
      await api.delete(`/api/bookmarks/${encodeURIComponent(verseKey)}`);
      setBookmarks(prev => prev.filter(b => b.verse_key !== verseKey));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    } finally {
      setDeletingKey(null);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const query = searchQuery.toLowerCase();
    const verseKey = b.verse_key?.toLowerCase() || '';
    const surahName = (b.surah_name || b.surah_english_name || '').toLowerCase();
    const translation = (b.translation_text || '').toLowerCase();
    return verseKey.includes(query) || surahName.includes(query) || translation.includes(query);
  });

  if (loading) {
    return (
      <div className="theme-page min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent/20 animate-ping absolute" />
          <RiLoader4Line size={36} className="theme-accent animate-spin relative z-10" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] theme-subtle font-bold">
          Retrieving Sacred Verses
        </p>
      </div>
    );
  }

  return (
    <div className="theme-page min-h-screen theme-transition pb-20">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 safe-area-top safe-area-bottom">
        
        {/* Navigation & Actions */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="theme-icon-button"
            aria-label="Go back"
          >
            <RiArrowLeftLine size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="theme-button-outline !min-h-[2.4rem] !py-1 !px-3.5 text-xs font-semibold gap-1.5"
            >
              <RiCompass3Line size={16} />
              <span>Explore Surahs</span>
            </Link>
          </div>
        </header>

        {/* Hero Banner with Islamic Aesthetic Pattern */
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 border border-theme bg-theme-card shadow-lg shadow-black/5">
          <div 
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-20 pointer-events-none blur-3xl"
            style={{ background: 'var(--gradient-gold)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
                
                <span>Personal Collection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight theme-text">
                Saved Verses
              </h1>
              <p className="text-sm theme-muted mt-1 max-w-md">
                Your sanctuary of marked ayahs kept ready for daily reflection, memorization, and contemplation.
              </p>
            </div>

            {/* Total Counter Badge */}
            <div className="flex items-center gap-3 self-stretch sm:self-center justify-center p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-theme-soft border border-theme">
              <RiBookmarkFill className="theme-gold shrink-0" size={22} />
              <div className="text-left">
                <span className="block text-lg font-black theme-text leading-none">
                  {bookmarks.length}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold theme-subtle">
                  {bookmarks.length === 1 ? 'Ayah' : 'Ayahs'}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar (Shows if items exist) */}
          {bookmarks.length > 2 && (
            <div className="relative mt-6 pt-6 border-t border-theme">
              <RiSearchLine size={18} className="absolute left-3.5 top-[calc(50%+0.75rem)] -translate-y-1/2 theme-subtle pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by Surah name, verse number, or meaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="theme-input pl-10 text-sm"
              />
            </div>
          )}
        </section>
}
        {/* Content Section */}
        {bookmarks.length === 0 ? (
          <div className="theme-card p-12 sm:p-16 text-center border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mx-auto mb-5 transform rotate-3">
              <RiBookmarkFill size={30} />
            </div>
            <h2 className="text-xl font-bold theme-text mb-2 tracking-tight">
              Your Sanctuary is Empty
            </h2>
            <p className="theme-muted text-sm max-w-sm mx-auto leading-relaxed mb-6">
              When an ayah touches your heart during recitation, tap the bookmark icon to keep it here for contemplation.
            </p>
            <Link to="/" className="theme-button">
              Start Reading Now
            </Link>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="theme-card p-10 text-center border-dashed">
            <p className="text-base font-semibold theme-text">No verses match your search</p>
            <p className="text-xs theme-muted mt-1">Try searching for a different keyword or verse number.</p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {filteredBookmarks.map((bookmark) => {
              const isDeleting = deletingKey === bookmark.verse_key;
              const surahNum = bookmark.surah_id || bookmark.verse_key?.split(':')[0];
              const ayahNum = bookmark.verse_number || bookmark.verse_key?.split(':')[1];

              return (
                <div
                  key={bookmark.id || bookmark.verse_key}
                  className="theme-card theme-card-lift p-5 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <Link
                    to={`/surah/${surahNum}?ayah=${ayahNum}`}
                    className="flex-1 flex items-start gap-4 min-w-0 w-full"
                  >
                    {/* Ayah Index Circle */}
                    <div className="ayah-number shrink-0 font-bold text-xs mt-0.5">
                      {ayahNum}
                    </div>

                    {/* Metadata & Verse Snippets */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-base font-bold theme-text group-hover:text-accent transition-colors">
                          {bookmark.surah_name || `Surah ${surahNum}`}
                        </h2>
                        <span className="text-[11px] font-semibold theme-badge py-0.5 px-2 bg-theme-soft">
                          Verse {bookmark.verse_key}
                        </span>
                      </div>

                      {/* Arabic Snippet (If available in API data) */}
                      {bookmark.arabic_text && (
                        <p className="font-arabic text-xl sm:text-2xl text-right leading-loose theme-text my-2.5 line-clamp-2" dir="rtl">
                          {bookmark.arabic_text}
                        </p>
                      )}

                      {/* Translation Preview (If available) */}
                      {bookmark.translation_text ? (
                        <p className="text-xs sm:text-sm theme-secondary line-clamp-2 leading-relaxed italic">
                          "{bookmark.translation_text}"
                        </p>
                      ) : (
                        <p className="text-xs theme-subtle font-medium">
                          Surah {surahNum} • Reflection saved
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Actions (Delete & Navigate) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-theme w-full sm:w-auto justify-end">
                    <button
                      onClick={(e) => removeBookmark(e, bookmark.verse_key)}
                      disabled={isDeleting}
                      className="theme-icon-button theme-icon-button-sm text-subtle hover:!text-rose-500 hover:!bg-rose-500/10 hover:!border-rose-500/40"
                      aria-label={`Remove bookmark for verse ${bookmark.verse_key}`}
                      title="Remove Bookmark"
                    >
                      {isDeleting ? (
                        <RiLoader4Line size={16} className="animate-spin text-rose-500" />
                      ) : (
                        <RiDeleteBinLine size={16} />
                      )}
                    </button>

                    <Link
                      to={`/surah/${surahNum}?ayah=${ayahNum}`}
                      className="theme-icon-button theme-icon-button-sm group-hover:!bg-accent-soft group-hover:!text-accent group-hover:!border-accent/40"
                      aria-label="Open verse"
                      title="Open Verse"
                    >
                      <RiArrowRightUpLine size={17} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default Bookmarks;