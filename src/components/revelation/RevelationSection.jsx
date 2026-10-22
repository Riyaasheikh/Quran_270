import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiInformationLine,
  RiLoader4Line,
  RiErrorWarningLine,
} from '@remixicon/react';
import { fetchChapters } from '../../api/quranApi';

const RevelationSection = () => {
  const [chapters, setChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('ASCENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const getChapters = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchChapters();

        if (mounted) {
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching revelation data:', err);

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getChapters();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) =>
      sortOrder === 'ASCENDING'
        ? a.revelation_order - b.revelation_order
        : b.revelation_order - a.revelation_order
    );
  }, [chapters, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING'
    );
  };

  return (
    <section className="theme-page min-h-screen">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* =========================
            HEADER
        ========================== */}
        <header className="relative mb-12 lg:mb-16">

          {/* Desktop sort control */}
          <div className="absolute left-0 top-0 hidden md:block">
            <span className="theme-muted mb-2 block text-[8px] font-black uppercase tracking-[0.2em]">
              Sort By
            </span>

            <button
              type="button"
              onClick={toggleSort}
              className="
                theme-button-outline
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                px-4
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
            >
              {sortOrder === 'ASCENDING' ? (
                <>
                  ASC
                  <RiArrowUpSLine size={14} />
                </>
              ) : (
                <>
                  DESC
                  <RiArrowDownSLine size={14} />
                </>
              )}
            </button>
          </div>

          {/* Center heading */}
          <div className="text-center">

            <div className="mx-auto mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-accent opacity-50 sm:w-12" />

              <span className="theme-muted text-[9px] font-bold uppercase tracking-[0.28em]">
                114 Revelations
              </span>

              <span className="h-px w-8 bg-accent opacity-50 sm:w-12" />
            </div>

            <h1 className="theme-text text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl">
              Chronological
              <span className="theme-accent ml-2 font-serif font-normal italic">
                Revelation
              </span>
            </h1>

            <p className="theme-muted mt-3 text-[9px] font-bold uppercase tracking-[0.22em] sm:text-[10px] sm:tracking-[0.3em]">
              Based on the traditional revelation order
            </p>
          </div>

          {/* Mobile sort */}
          <div className="mt-7 flex justify-center md:hidden">
            <button
              type="button"
              onClick={toggleSort}
              className="
                theme-button-outline
                inline-flex
                items-center
                gap-2
                rounded-full
                px-4
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
              "
            >
              Sort:
              {sortOrder === 'ASCENDING' ? 'Ascending' : 'Descending'}

              {sortOrder === 'ASCENDING' ? (
                <RiArrowUpSLine size={14} />
              ) : (
                <RiArrowDownSLine size={14} />
              )}
            </button>
          </div>
        </header>

        {/* =========================
            INFO BAR
        ========================== */}
        <div className="theme-card mb-8 flex items-start gap-3 rounded-2xl border p-4 shadow-sm sm:items-center">
          <div className="bg-accent-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <RiInformationLine
              size={17}
              className="text-accent"
            />
          </div>

          <p className="theme-muted text-[10px] leading-relaxed sm:text-xs">
            Surahs are arranged according to their traditional chronological
            revelation order rather than their position in the Mushaf.
          </p>
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="theme-card flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-sm">
              <RiLoader4Line
                size={20}
                className="text-accent animate-spin"
              />

              <span className="theme-muted text-xs font-semibold">
                Loading revelation order...
              </span>
            </div>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && error && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="theme-card max-w-md rounded-2xl border p-8 text-center shadow-sm">
              <div className="bg-accent-soft mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <RiErrorWarningLine
                  size={22}
                  className="text-accent"
                />
              </div>

              <h2 className="theme-text text-lg font-bold">
                Unable to load revelation order
              </h2>

              <p className="theme-muted mt-2 text-sm">
                Please check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="theme-button mt-5 rounded-full px-5 py-2.5 text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =========================
            REVELATION GRID
        ========================== */}
        {!loading && !error && sortedChapters.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
              xl:grid-cols-8
            "
          >
            {sortedChapters.map((surah) => {
              const isMakkah =
                surah.revelation_place?.toLowerCase() === 'makkah';

              return (
                <button
                  key={surah.id}
                  type="button"
                  onClick={() => navigate(`/surah/${surah.id}`)}
                  className="
                    theme-card
                    group
                    relative
                    flex
                    min-h-[175px]
                    flex-col
                    items-center
                    overflow-hidden
                    rounded-2xl
                    border
                    p-4
                    text-center
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    focus:outline-none
                    focus:ring-2
                    focus:ring-accent
                    focus:ring-offset-2
                  "
                >
                  {/* Revelation number */}
                  <div className="theme-gold mb-2 text-[10px] font-black tracking-[0.18em]">
                    {String(surah.revelation_order).padStart(2, '0')}
                  </div>

                  {/* Name */}
                  <h2 className="theme-text w-full truncate text-[11px] font-black uppercase tracking-tight transition-colors group-hover:text-accent">
                    {surah.name_simple}
                  </h2>

                  {/* Arabic */}
                  <div
                    dir="rtl"
                    lang="ar"
                    className="
                      font-quran
                      theme-accent
                      mt-2
                      text-lg
                      leading-relaxed
                      opacity-70
                      transition-all
                      duration-300
                      group-hover:opacity-100
                    "
                  >
                    {surah.name_arabic}
                  </div>

                  {/* Divider */}
                  <div
                    className="
                      my-3
                      h-px
                      w-6
                      bg-border-theme
                      transition-all
                      duration-500
                      group-hover:w-10
                      group-hover:bg-accent
                    "
                  />

                  {/* Metadata */}
                  <div className="mt-auto flex flex-col items-center gap-1">

                    <span className="theme-subtle text-[8px] font-bold uppercase tracking-wide">
                      Surah {surah.id}
                    </span>

                    <span
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-[7px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        ${
                          isMakkah
                            ? 'bg-gold-soft text-gold'
                            : 'bg-accent-soft text-accent'
                        }
                      `}
                    >
                      {surah.revelation_place}
                    </span>
                  </div>

                  {/* Bottom hover line */}
                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-0.5
                      w-0
                      -translate-x-1/2
                      bg-accent
                      transition-all
                      duration-500
                      group-hover:w-12
                    "
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sortedChapters.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="theme-card rounded-2xl border p-8 text-center">
              <h2 className="theme-text font-bold">
                No Surahs found
              </h2>

              <p className="theme-muted mt-2 text-sm">
                Revelation data is currently unavailable.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RevelationSection;