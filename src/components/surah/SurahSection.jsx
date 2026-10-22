import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiExpandDiagonalLine,
  RiBookOpenLine,
  RiLoader4Line,
  RiErrorWarningLine,
} from '@remixicon/react';
import { fetchChapters } from '../../api/quranApi';

const SurahSection = () => {
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
        console.error('Error fetching Surahs:', err);

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
        ? a.id - b.id
        : b.id - a.id
    );
  }, [chapters, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING'
    );
  };

  return (
    <section className="theme-page min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* =========================
            HEADER
        ========================== */}
        <header className="mb-12 text-center lg:mb-16">

          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent opacity-50 sm:w-12" />

            <span className="theme-muted text-[9px] font-bold uppercase tracking-[0.28em]">
              114 Chapters
            </span>

            <span className="h-px w-8 bg-accent opacity-50 sm:w-12" />
          </div>

          <h1 className="theme-text text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl">
            Surahs of the Quran
          </h1>

          <p className="theme-muted mx-auto mt-3 max-w-xl text-xs leading-relaxed sm:text-sm">
            Explore all 114 chapters of the Holy Quran.
          </p>

          {/* Sort control */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-border-theme sm:w-16" />

            <button
              type="button"
              onClick={toggleSort}
              aria-label={`Sort ${sortOrder === 'ASCENDING' ? 'descending' : 'ascending'}`}
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
                tracking-[0.16em]
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
            >
              <span>
                {sortOrder === 'ASCENDING' ? 'Ascending' : 'Descending'}
              </span>

              {sortOrder === 'ASCENDING' ? (
                <RiArrowUpSLine
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
              ) : (
                <RiArrowDownSLine
                  size={15}
                  className="transition-transform group-hover:translate-y-0.5"
                />
              )}
            </button>

            <div className="h-px w-8 bg-border-theme sm:w-16" />
          </div>
        </header>

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
                Loading Surahs...
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
                Unable to load Surahs
              </h2>

              <p className="theme-muted mt-2 text-sm leading-relaxed">
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
            EMPTY STATE
        ========================== */}
        {!loading && !error && sortedChapters.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="theme-card rounded-2xl border p-8 text-center">
              <RiBookOpenLine
                size={30}
                className="text-accent mx-auto mb-3"
              />

              <h2 className="theme-text font-bold">
                No Surahs found
              </h2>

              <p className="theme-muted mt-1 text-sm">
                There are no chapters available right now.
              </p>
            </div>
          </div>
        )}

        {/* =========================
            SURAH GRID
        ========================== */}
        {!loading && !error && sortedChapters.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              sm:gap-4
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
              2xl:gap-5
            "
          >
            {sortedChapters.map((surah) => (
              <button
                key={surah.id}
                type="button"
                onClick={() => navigate(`/${surah.id}`)}
                className="
                  theme-card
                  group
                  relative
                  flex
                  min-h-[190px]
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  p-5
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
                {/* Top accent */}
                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    h-1
                    w-0
                    -translate-x-1/2
                    rounded-b-full
                    bg-accent
                    transition-all
                    duration-500
                    group-hover:w-16
                  "
                />

                {/* Surah number */}
                <span className="theme-gold mb-3 text-[10px] font-black tracking-[0.2em]">
                  {String(surah.id).padStart(3, '0')}
                </span>

                {/* Arabic name */}
                <div
                  dir="rtl"
                  lang="ar"
                  className="
                    font-quran
                    theme-text
                    flex
                    min-h-[58px]
                    items-center
                    justify-center
                    text-2xl
                    leading-relaxed
                    transition-colors
                    duration-300
                    group-hover:text-accent
                    sm:text-3xl
                  "
                >
                  {surah.name_arabic}
                </div>

                {/* Divider */}
                <div
                  className="
                    mt-3
                    mb-3
                    h-px
                    w-7
                    bg-accent
                    opacity-60
                    transition-all
                    duration-500
                    group-hover:w-12
                    group-hover:opacity-100
                  "
                />

                {/* English name */}
                <h2 className="theme-text w-full truncate text-xs font-black uppercase tracking-wide">
                  {surah.name_simple}
                </h2>

                {/* Translation */}
                <p className="theme-muted mt-1 w-full truncate text-[9px] font-semibold uppercase tracking-wide">
                  {surah.translated_name?.name || ''}
                </p>

                {/* Hover arrow */}
                <div
                  className="
                    absolute
                    bottom-3
                    right-3
                    flex
                    h-6
                    w-6
                    translate-x-1
                    items-center
                    justify-center
                    rounded-full
                    bg-accent-soft
                    text-accent
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-x-0
                    group-hover:opacity-100
                  "
                >
                  <RiExpandDiagonalLine size={12} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SurahSection;