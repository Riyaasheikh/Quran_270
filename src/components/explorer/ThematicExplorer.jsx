import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiBookOpenLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiCompass3Line,
  RiErrorWarningLine,
  RiSearchLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiInformationLine,
  RiRefreshLine,
} from '@remixicon/react';

import Navbar from '../global/Navbar';
import Footer from '../global/Footer';
import api from '../../lib/axios';
import { EmptySearchState } from './explorerHelpers';

export const fetchThematicTopics = async () => {
  const response = await api.get('/api/quran/topics');
  const receivedTopics = response.data?.topics;

  if (!Array.isArray(receivedTopics)) return [];

  return receivedTopics.filter(
    (topic) =>
      topic &&
      typeof topic.topic_title === 'string' &&
      Array.isArray(topic.verses)
  );
};

export default function ThematicExplorer({
  externalSearch,
  onClearSearch,
  isEmbedded = false,
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const navigate = useNavigate();

  // Uses parent search when embedded, or internal state when standalone
  const search = externalSearch !== undefined ? externalSearch : internalSearch;
  const clearSearch = onClearSearch || (() => setInternalSearch(''));

  const {
    data: topics = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quran-thematic-topics'],
    queryFn: fetchThematicTopics,
  });

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topics;

    return topics.filter((topic) => {
      const titleMatches = topic.topic_title?.toLowerCase().includes(query);
      const verseMatches = topic.verses?.some(
        (verse) =>
          verse.verse_key?.toLowerCase().includes(query) ||
          verse.relation_note?.toLowerCase().includes(query) ||
          verse.classification?.toLowerCase().includes(query)
      );

      return titleMatches || verseMatches;
    });
  }, [topics, search]);

  const openVerse = (verseKey) => {
    if (!verseKey || !/^\d{1,3}:\d{1,3}$/.test(verseKey)) return;
    const [surahNumber, verseNumber] = verseKey.split(':');
    navigate(`/surah/${surahNumber}/${verseNumber}`);
  };

  const content = (
    <>
      {/* Standalone Header & Search (Hidden when embedded in QuranExplorer) */}
      {!isEmbedded && (
        <div className="mb-8">
          <div className="mb-6">
            <Link
              to="/"
              className="theme-button-outline !min-h-[2.35rem] !px-4 !rounded-full text-xs inline-flex items-center gap-2"
            >
              <RiArrowLeftLine size={16} />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 theme-badge theme-badge-accent mb-4">
              <RiCompass3Line size={15} />
              <span className="uppercase tracking-[0.16em] text-[10px] sm:text-xs">
                Thematic Discovery
              </span>
            </div>
            <h1 className="theme-text text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore the Quran <span className="theme-accent">Through Its Themes</span>
            </h1>
          </div>

          <div className="relative max-w-md mx-auto">
            <RiSearchLine
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-muted pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder="Search themes, notes, or 2:255..."
              className="theme-input pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-icon-button theme-icon-button-sm"
              >
                <RiCloseLine size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Notice */}
      <div className="bg-gold-soft border border-theme flex items-start gap-3 rounded-xl p-4 mb-6">
        <RiInformationLine size={20} className="theme-gold shrink-0 mt-0.5" />
        <div>
          <p className="theme-text text-sm font-semibold">
            About thematic connections
          </p>
          <p className="theme-secondary text-xs leading-6 mt-0.5">
            These connections are provided as thematic study candidates. Check
            their source and review status before treating them as established
            scholarly interpretations.
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="theme-card theme-card-static flex flex-col items-center justify-center py-20 px-5">
          <RiLoader4Line size={35} className="animate-spin theme-accent mb-4" />
          <p className="theme-text text-sm font-semibold">
            Exploring Quranic themes...
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="theme-card theme-card-static p-8 text-center">
          <RiErrorWarningLine
            size={28}
            className="mx-auto mb-3"
            style={{ color: 'var(--danger)' }}
          />
          <h3 className="theme-text font-bold text-lg">
            Unable to load themes
          </h3>
          <p className="theme-muted text-sm mt-1">
            Ensure your backend server is running and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="theme-button mt-5"
          >
            <RiRefreshLine size={16} />
            <span>Try again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredTopics.length === 0 && (
        <EmptySearchState
          title="No matching themes"
          query={search}
          onClear={clearSearch}
        />
      )}

      {/* Topic Grid */}
      {!isLoading && !isError && filteredTopics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => {
            const topicKey = topic.topic_slug || topic.topic_title;

            return (
              <article
                key={topicKey}
                className="theme-card theme-card-static overflow-hidden flex flex-col"
              >
                <div
                  className="h-1 w-full"
                  style={{ background: 'var(--gradient-primary)' }}
                />

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="bg-accent-soft theme-accent w-10 h-10 rounded-xl shrink-0 flex items-center justify-center">
                        <RiBookOpenLine size={20} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="theme-text font-bold text-base sm:text-lg leading-snug">
                          {topic.topic_title}
                        </h2>
                        <p className="theme-muted text-xs mt-1">
                          Connected Quranic passages
                        </p>
                      </div>
                    </div>

                    <span className="theme-badge theme-badge-gold shrink-0">
                      {topic.verse_count ?? topic.verses.length} verses
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {topic.verses.map((verse) => {
                      const status = verse.review_status || '';
                      const isVerified =
                        status.toLowerCase().includes('verified') &&
                        !status.toLowerCase().includes('unverified');

                      return (
                        <button
                          key={`${topicKey}-${verse.verse_key}`}
                          type="button"
                          onClick={() => openVerse(verse.verse_key)}
                          className="group w-full text-left bg-theme-soft border border-theme hover:border-accent rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="theme-accent text-xs font-bold">
                                  {verse.verse_key}
                                </span>
                                {verse.classification && (
                                  <span className="theme-muted text-[10px] px-2 py-0.5 rounded-full border border-theme bg-theme-card">
                                    {verse.classification}
                                  </span>
                                )}
                              </div>

                              <p className="theme-secondary text-xs leading-5 mt-1.5 line-clamp-2">
                                {verse.relation_note ||
                                  'Explore this Quranic passage.'}
                              </p>

                              {verse.review_status && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  {isVerified ? (
                                    <RiShieldCheckLine
                                      size={13}
                                      style={{ color: 'var(--success)' }}
                                    />
                                  ) : (
                                    <RiInformationLine
                                      size={13}
                                      style={{ color: 'var(--warning)' }}
                                    />
                                  )}
                                  <span className="theme-muted text-[10px] capitalize">
                                    {verse.review_status
                                      .replaceAll('_', ' ')
                                      .toLowerCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <span className="bg-accent-soft theme-accent w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                              <RiArrowRightLine size={16} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );

  if (isEmbedded) return content;

  return (
    <div className="theme-page theme-transition min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {content}
      </main>
      <Footer />
    </div>
  );
}