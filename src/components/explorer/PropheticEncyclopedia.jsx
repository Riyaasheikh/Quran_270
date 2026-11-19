import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiSearchLine,
  RiCloseLine,
  RiLoader4Line,
  RiBookOpenLine,
  RiUserStarLine,
  RiGroupLine,
  RiShieldCheckLine,
  RiErrorWarningLine,
  RiArrowLeftLine,
  RiRefreshLine,
} from '@remixicon/react';

import Navbar from '../global/Navbar';
import Footer from '../global/Footer';
import api from '../../lib/axios';
import {
  parseList,
  parseAnchors,
  AnchorChips,
  NoteBox,
  EmptySearchState,
} from './explorerHelpers';

export const fetchPropheticData = async () => {
  const [prophetsRes, figuresRes] = await Promise.all([
    api.get('/api/quran/prophets'),
    api.get('/api/quran/figures'),
  ]);

  return {
    prophets: Array.isArray(prophetsRes.data?.prophets)
      ? prophetsRes.data.prophets
      : [],
    figures: Array.isArray(figuresRes.data?.figures)
      ? figuresRes.data.figures
      : [],
  };
};

export default function PropheticEncyclopedia({
  activeSubTab,
  externalSearch,
  onClearSearch,
  isEmbedded = false,
}) {
  const [internalTab, setInternalTab] = useState('prophets');
  const [internalSearch, setInternalSearch] = useState('');
  const navigate = useNavigate();

  const currentTab = activeSubTab || internalTab;
  const searchQuery =
    externalSearch !== undefined ? externalSearch : internalSearch;
  const clearSearch = onClearSearch || (() => setInternalSearch(''));

  const {
    data = { prophets: [], figures: [] },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quran-prophetic-encyclopedia'],
    queryFn: fetchPropheticData,
  });

  const { prophets, figures } = data;

  const filteredProphets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return prophets;
    return prophets.filter(
      (p) =>
        p.prophet_name?.toLowerCase().includes(q) ||
        p.name_ar?.includes(q) ||
        p.quranic_status_note?.toLowerCase().includes(q) ||
        p.proposed_segments?.toLowerCase().includes(q) ||
        p.principal_passage_anchors?.toLowerCase().includes(q)
    );
  }, [prophets, searchQuery]);

  const filteredFigures = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return figures;
    return figures.filter(
      (f) =>
        f.figure_or_group?.toLowerCase().includes(q) ||
        f.figure_type?.toLowerCase().includes(q) ||
        f.linked_prophets?.toLowerCase().includes(q) ||
        f.principal_anchors?.toLowerCase().includes(q)
    );
  }, [figures, searchQuery]);

  const handleJumpToVerse = (surahId, verseNum) => {
    if (surahId && verseNum) {
      navigate(`/surah/${surahId}/${verseNum}`);
    }
  };

  const tabClass = (tab) =>
    `flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      currentTab === tab
        ? 'bg-accent text-white shadow-sm'
        : 'theme-muted hover:theme-text'
    }`;

  const content = (
    <>
      {/* Standalone Header, Sub-tabs & Search (Hidden when embedded) */}
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
              <RiShieldCheckLine size={15} />
              <span className="uppercase tracking-[0.16em] text-[10px] sm:text-xs">
                Verified Relational Knowledge Graph
              </span>
            </div>
            <h1 className="theme-text text-3xl sm:text-4xl font-extrabold tracking-tight">
              Prophets &amp; <span className="theme-accent">Quranic Figures</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="bg-theme-card border border-theme p-1.5 rounded-2xl flex items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setInternalTab('prophets')}
                className={tabClass('prophets')}
              >
                <RiUserStarLine size={16} />
                <span>Prophets ({prophets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setInternalTab('figures')}
                className={tabClass('figures')}
              >
                <RiGroupLine size={16} />
                <span>Figures &amp; Groups ({figures.length})</span>
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <RiSearchLine
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-muted pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setInternalSearch(e.target.value)}
                placeholder="Filter prophets, figures, or events..."
                className="theme-input pl-10 pr-10"
              />
              {searchQuery && (
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
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="theme-card theme-card-static flex flex-col items-center justify-center py-20 px-5">
          <RiLoader4Line size={35} className="theme-accent animate-spin mb-4" />
          <p className="theme-text text-sm font-semibold">
            Loading Prophetic Directory...
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
            Unable to load prophetic records
          </h3>
          <p className="theme-muted text-sm mt-1">
            Ensure your backend server is running and seeded.
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

      {/* PROPHETS VIEW */}
      {!isLoading && !isError && currentTab === 'prophets' && (
        <>
          {filteredProphets.length === 0 ? (
            <EmptySearchState
              title="No matching prophets"
              query={searchQuery}
              onClear={clearSearch}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProphets.map((prophet) => {
                const rawAnchorField =
                  prophet.principal_passage_anchors ||
                  prophet.principal_anchors ||
                  prophet.passage_anchors ||
                  '';
                const anchors = parseAnchors(rawAnchorField);
                const segments = parseList(prophet.proposed_segments);

                return (
                  <article
                    key={prophet.id || prophet.prophet_name}
                    className="theme-card theme-card-static overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="h-1 w-full"
                        style={{ background: 'var(--gradient-gold)' }}
                      />

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest theme-accent">
                              Prophet #{prophet.prophet_no}
                            </span>
                            <h2 className="text-xl font-extrabold theme-text flex items-center gap-2.5 mt-0.5">
                              <span>{prophet.prophet_name}</span>
                              {prophet.name_ar && (
                                <span
                                  lang="ar"
                                  className="font-arabic text-2xl theme-gold font-normal"
                                >
                                  {prophet.name_ar}
                                </span>
                              )}
                            </h2>
                          </div>

                          {prophet.status && (
                            <span className="theme-badge theme-badge-gold shrink-0 capitalize">
                              {prophet.status.replaceAll('_', ' ')}
                            </span>
                          )}
                        </div>

                        {prophet.quranic_status_note && (
                          <p className="text-xs theme-secondary leading-relaxed mb-4">
                            {prophet.quranic_status_note}
                          </p>
                        )}

                        {segments.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider theme-muted mb-2">
                              Key Narrative Segments
                            </h3>
                            <ul className="space-y-1.5">
                              {segments.slice(0, 4).map((seg, i) => (
                                <li
                                  key={i}
                                  className="text-xs theme-secondary bg-theme-soft px-3 py-1.5 rounded-lg border border-theme"
                                >
                                  • {seg}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {anchors.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider theme-muted mb-2 flex items-center gap-1.5">
                              <RiBookOpenLine size={13} className="theme-accent" />
                              <span>Passage Anchors (Click to Read)</span>
                            </h3>
                            <AnchorChips
                              anchors={anchors.slice(0, 10)}
                              onJump={handleJumpToVerse}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {prophet.flags_and_do_not_assume && (
                      <div className="px-6 pb-6">
                        <NoteBox label="Scholarly Boundary">
                          {prophet.flags_and_do_not_assume}
                        </NoteBox>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* FIGURES & GROUPS VIEW */}
      {!isLoading && !isError && currentTab === 'figures' && (
        <>
          {filteredFigures.length === 0 ? (
            <EmptySearchState
              title="No matching figures or groups"
              query={searchQuery}
              onClear={clearSearch}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFigures.map((item) => {
                const anchors = parseAnchors(
                  item.principal_anchors || item.principal_passage_anchors || ''
                );

                return (
                  <article
                    key={item.id || item.figure_or_group}
                    className="theme-card theme-card-static p-6 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.figure_type && (
                          <span className="theme-badge theme-badge-accent capitalize">
                            {item.figure_type.replaceAll('_', ' ')}
                          </span>
                        )}
                        {item.identity_status && (
                          <span className="theme-badge capitalize">
                            {item.identity_status.replaceAll('_', ' ')}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold theme-text mb-3">
                        {item.figure_or_group}
                      </h2>

                      {item.linked_prophets && item.linked_prophets !== '-' && (
                        <p className="text-xs theme-muted mb-3">
                          <span className="font-semibold theme-secondary">
                            Linked Prophets:{' '}
                          </span>
                          {item.linked_prophets}
                        </p>
                      )}

                      {anchors.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider theme-muted mb-2">
                            Quranic Occurrences
                          </h3>
                          <AnchorChips
                            anchors={anchors}
                            onJump={handleJumpToVerse}
                          />
                        </div>
                      )}
                    </div>

                    {item.do_not_assume_or_flags && (
                      <NoteBox label="Verification Note">
                        {item.do_not_assume_or_flags}
                      </NoteBox>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
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