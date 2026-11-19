import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiSearchLine,
  RiCloseLine,
  RiBookOpenLine,
  RiUserStarLine,
  RiGroupLine,
  RiArrowLeftLine,
  RiCompass3Line,
} from '@remixicon/react';

import Navbar from '../components/global/Navbar';
import Footer from '../components/global/Footer';
import ThematicExplorer, {
  fetchThematicTopics,
} from '../components/explorer/ThematicExplorer';
import PropheticEncyclopedia, {
  fetchPropheticData,
} from '../components/explorer/PropheticEncyclopedia';

const VALID_TABS = ['themes', 'prophets', 'figures'];

export default function QuranExplorer({ defaultTab = 'themes' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const urlTab = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(urlTab) ? urlTab : defaultTab;

  const handleTabChange = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };

  // Shares the exact same React Query cache keys as the child components
  const { data: topics = [] } = useQuery({
    queryKey: ['quran-thematic-topics'],
    queryFn: fetchThematicTopics,
  });

  const { data: propheticData = { prophets: [], figures: [] } } = useQuery({
    queryKey: ['quran-prophetic-encyclopedia'],
    queryFn: fetchPropheticData,
  });

  const tabClass = (tab) =>
    `flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-accent text-white shadow-sm'
        : 'theme-muted hover:theme-text'
    }`;

  const searchPlaceholder =
    activeTab === 'themes'
      ? 'Search themes or verse refs (e.g. 2:255)...'
      : activeTab === 'prophets'
      ? 'Search Musa, Ibrahim, events, or surahs...'
      : 'Search figures, groups, or linked prophets...';

  return (
    <div className="theme-page theme-transition min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* TOP BACK BUTTON */}
        <div className="mb-6">
          <Link
            to="/"
            className="theme-button-outline !min-h-[2.35rem] !px-4 !rounded-full text-xs inline-flex items-center gap-2"
          >
            <RiArrowLeftLine size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* HERO HEADER */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 theme-badge theme-badge-accent mb-4">
            <RiCompass3Line size={15} />
            <span className="uppercase tracking-[0.16em] text-[10px] sm:text-xs">
              Relational Knowledge Graph
            </span>
          </div>

          <h1 className="theme-text text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
            Quranic Themes, Prophets
            <span className="theme-accent block mt-1.5">&amp; Historical Figures</span>
          </h1>

          <p className="theme-muted text-sm sm:text-base leading-7 max-w-2xl mx-auto mt-4">
            Explore interconnected Quranic topics, canonical prophetic narratives,
            and mentioned nations—and jump directly to their verses.
          </p>
        </div>

        {/* UNIFIED TAB BAR + SEARCH */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          <div className="bg-theme-card border border-theme p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => handleTabChange('themes')}
              className={tabClass('themes')}
            >
              <RiBookOpenLine size={16} />
              <span>Themes ({topics.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('prophets')}
              className={tabClass('prophets')}
            >
              <RiUserStarLine size={16} />
              <span>Prophets ({propheticData.prophets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('figures')}
              className={tabClass('figures')}
            >
              <RiGroupLine size={16} />
              <span>Figures &amp; Groups ({propheticData.figures.length})</span>
            </button>
          </div>

          <div className="relative w-full lg:w-96">
            <RiSearchLine
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-muted pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search Quran Explorer"
              className="theme-input pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-icon-button theme-icon-button-sm"
              >
                <RiCloseLine size={16} />
              </button>
            )}
          </div>
        </div>

        {/* RENDER ACTIVE COMPONENT */}
        {activeTab === 'themes' ? (
          <ThematicExplorer
            isEmbedded
            externalSearch={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <PropheticEncyclopedia
            isEmbedded
            activeSubTab={activeTab}
            externalSearch={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}