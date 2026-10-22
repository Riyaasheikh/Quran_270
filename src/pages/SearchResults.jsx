import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  RiSearchLine, 
  RiArrowRightUpLine, 
  RiArrowLeftLine, 
  RiCompass3Line
} from '@remixicon/react';
import { searchQuran } from '../api/quranApi';
import Navbar from '../components/global/Navbar';
import Footer from '../components/global/Footer';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchQuran(query)
        .then(data => {
          setResults(data || []);
        })
        .catch(err => {
          console.error("Quran search service fault:", err);
          setResults([]);
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 safe-area-bottom">
          
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="theme-icon-button theme-icon-button-sm"
              aria-label="Go back"
            >
              <RiArrowLeftLine size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="theme-badge theme-badge-accent uppercase tracking-wider text-[10px] font-bold">
                Scripture Search
              </span>
            </div>
          </div>

          {/* Search Header Banner */}
          <header className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 border border-theme bg-theme-card shadow-lg shadow-black/5">
            <div 
              className="absolute -top-14 -right-14 w-48 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
              style={{ background: 'var(--gradient-primary)' }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] theme-subtle mb-1">
                  Query Results
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight theme-text flex items-center gap-2 flex-wrap">
                  <span>Results for</span>
                  <span className="theme-accent italic font-serif">"{query}"</span>
                </h1>
              </div>

              {!loading && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-theme-soft border border-theme self-stretch sm:self-auto justify-center">
                  <RiSearchLine size={18} className="theme-accent" />
                  <span className="text-xs font-bold theme-secondary">
                    {results.length} {results.length === 1 ? 'Ayah Found' : 'Ayahs Found'}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Results List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((skeleton) => (
                <div 
                  key={skeleton} 
                  className="theme-card p-6 animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-theme-soft rounded-full" />
                    <div className="h-5 w-8 bg-theme-soft rounded-full" />
                  </div>
                  <div className="h-10 bg-theme-soft rounded-xl w-3/4 ml-auto" />
                  <div className="h-4 bg-theme-soft rounded-md w-full" />
                  <div className="h-4 bg-theme-soft rounded-md w-2/3" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((res, index) => {
                const surahNum = res.verse_key?.split(':')[0];
                const ayahNum = res.verse_key?.split(':')[1];
                const translationText = res.translations?.[0]?.text;

                return (
                  <article
                    key={res.verse_key || index}
                    className="theme-card theme-card-lift p-6 group flex flex-col gap-4"
                  >
                    {/* Header: Verse Badge & Direct Navigation Link */}
                    <div className="flex items-center justify-between border-b border-theme/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="ayah-number font-bold text-xs">
                          {ayahNum}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider theme-accent">
                          Verse {res.verse_key}
                        </span>
                      </div>

                      <Link
                        to={`/surah/${surahNum}?ayah=${ayahNum}`}
                        className="inline-flex items-center gap-1 text-xs font-bold theme-muted hover:theme-accent transition-colors"
                        title="Read full context in Surah"
                      >
                        <span>Open Ayah</span>
                        <RiArrowRightUpLine size={15} />
                      </Link>
                    </div>

                    {/* Arabic Text */}
                    <p 
                      className="font-arabic text-xl sm:text-2xl text-right leading-loose theme-text my-2" 
                      dir="rtl"
                    >
                      {res.text}
                    </p>

                    {/* Translation with Search Highlights */}
                    {translationText && (
                      <div 
                        className="translation-text text-sm sm:text-base leading-relaxed theme-secondary bg-theme-soft/50 p-4 rounded-xl border border-theme/40"
                        dangerouslySetInnerHTML={{ __html: translationText }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="theme-card p-12 text-center border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-theme-soft flex items-center justify-center mx-auto mb-4 theme-subtle">
                <RiSearchLine size={28} />
              </div>
              <h2 className="text-lg font-bold theme-text mb-1">
                No Divine Revelations Found
              </h2>
              <p className="theme-muted text-sm max-w-sm mx-auto leading-relaxed mb-6">
                We couldn't locate any ayahs matching your query. Try alternative keywords or search directly in Arabic.
              </p>
              <Link to="/" className="theme-button inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <RiCompass3Line size={16} />
                <span>Return to Surah Index</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;