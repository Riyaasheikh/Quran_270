import React, { useEffect, useState } from "react";

import {
  RiRefreshLine,
  RiLoader4Line,
  RiArrowRightLine,
} from "@remixicon/react";

import { Link } from "react-router-dom";

import {
  fetchSpecificVerse,
  fetchChapterDetail,
} from "../../api/quranApi";

import SectionWrapper from "../../ui/SectionWrapper";

const RandomVerse = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRandomVerse = async () => {
    setLoading(true);

    try {
      const randomSurahId =
        Math.floor(Math.random() * 114) + 1;

      const chapter =
        await fetchChapterDetail(randomSurahId);

      const totalVerses =
        Number(chapter?.verses_count) || 1;

      const randomVerseNumber =
        Math.floor(Math.random() * totalVerses) + 1;

      const verseKey =
        `${randomSurahId}:${randomVerseNumber}`;

      const data =
        await fetchSpecificVerse(verseKey);

      setVerse(data);
    } catch (error) {
      console.error(
        "Failed to fetch random verse:",
        error
      );

      setVerse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRandomVerse();
  }, []);

  if (loading) {
    return (
      <SectionWrapper>
        <div className="theme-card p-12 flex flex-col items-center justify-center gap-4">

          <RiLoader4Line
            size={32}
            className="text-accent animate-spin"
          />

          <p className="text-sm font-medium theme-muted animate-pulse">
            Selecting a verse...
          </p>

        </div>
      </SectionWrapper>
    );
  }

  if (!verse) {
    return (
      <SectionWrapper>
        <div className="theme-card p-10 text-center">
          <p className="theme-muted">
            Unable to load a verse right now.
          </p>

          <button
            onClick={getRandomVerse}
            className="theme-button mt-5"
          >
            Try Again
          </button>
        </div>
      </SectionWrapper>
    );
  }

  const [sId, vNum] =
    verse?.verse_key?.split(":") || [];

  return (
    <SectionWrapper>

      <article className="theme-card overflow-hidden">

        <div className="p-6 md:p-8 lg:p-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">

            <span
              className="
                inline-flex
                items-center
                rounded-full
                px-4
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                bg-accent-soft
                text-accent
              "
            >
              Verse of the Moment
            </span>

            <button
              onClick={getRandomVerse}
              className="
                p-2.5
                rounded-full
                theme-muted
                hover:text-accent
                hover:bg-accent-soft
                transition-all
              "
              aria-label="Get another random verse"
            >
              <RiRefreshLine size={20} />
            </button>

          </div>


          {/* Verse */}
          <div className="space-y-8">

            <p
              className="
                font-quran
                text-right
                text-[30px]
                md:text-[38px]
                lg:text-[42px]
              "
              dir="rtl"
            >
              {verse?.text_uthmani}
            </p>


            {/* Translation */}
            <div
              className="
                pl-5
                border-l-2
              "
              style={{
                borderColor: "var(--accent)",
              }}
            >
              <p
                className="
                  text-theme-secondary
                  text-base
                  md:text-lg
                  leading-relaxed
                  italic
                "
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      verse?.translations?.[0]?.text ||
                      "Translation unavailable.",
                  }}
                />
              </p>
            </div>

          </div>


          {/* Footer */}
          <div
            className="
              mt-10
              pt-6
              border-t
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-5
            "
            style={{
              borderColor: "var(--border)",
            }}
          >

            <div className="flex flex-col">

              <span className="text-[10px] font-black uppercase tracking-[0.18em] theme-subtle">
                Reference
              </span>

              <span className="text-sm font-black text-theme mt-1">
                {verse?.verse_key}
              </span>

            </div>


            <Link
              to={`/surah/${sId}/${vNum}`}
              className="theme-button theme-button-gold"
            >
              Go to Verse
              <RiArrowRightLine size={18} />
            </Link>

          </div>

        </div>

      </article>

    </SectionWrapper>
  );
};

export default RandomVerse;