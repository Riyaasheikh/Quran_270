import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  RiBookmarkFill,
  RiArrowRightSLine,
  RiLoader4Line,
  RiHistoryLine,
} from "@remixicon/react";

import { Link } from "react-router-dom";

import SectionWrapper from "./SectionWrapper";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";

const ContinueReading = () => {
  const [lastRead, setLastRead] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      setLastRead(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    setLoading(true);

    api
      .get("/api/last-read")
      .then((response) => {
        if (!mounted) return;

        const data = response?.data;

        if (data?.surah_id) {
          setLastRead(data);
        } else {
          setLastRead(null);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load reading progress:",
          error
        );

        if (mounted) {
          setLastRead(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user]);


  return (
    <SectionWrapper>

      <div className="max-w-[1400px] mx-auto px-4 py-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl md:text-3xl font-black text-theme tracking-tight">
            Continue Reading
          </h2>

          <Link
            to="/bookmarks"
            className="
              flex
              items-center
              gap-2
              text-accent
              font-semibold
              hover:opacity-70
              transition-opacity
            "
          >
            <RiBookmarkFill size={18} />

            <span>
              My Quran
            </span>
          </Link>

        </div>


        {/* Loading */}
        {loading && (
          <div className="theme-card flex justify-center py-14">

            <RiLoader4Line
              size={30}
              className="text-accent animate-spin"
            />

          </div>
        )}


        {/* Guest */}
        {!loading && !user && (
          <div className="theme-card p-10 text-center">

            <div
              className="
                w-16
                h-16
                mx-auto
                mb-5
                rounded-2xl
                flex
                items-center
                justify-center
                bg-accent-soft
              "
            >
              <RiBookmarkFill
                size={30}
                className="text-accent"
              />
            </div>

            <p className="text-theme-secondary font-medium mb-5">
              Sign in to track your reading progress.
            </p>

            <Link
              to="/login"
              className="theme-button"
            >
              Sign In
            </Link>

          </div>
        )}


        {/* No history */}
        {!loading && user && !lastRead && (
          <div className="theme-card p-10 text-center flex flex-col items-center">

            <div
              className="
                w-16
                h-16
                rounded-2xl
                flex
                items-center
                justify-center
                bg-accent-soft
                mb-5
              "
            >
              <RiHistoryLine
                size={32}
                className="text-accent"
              />
            </div>

            <p className="theme-muted max-w-sm">
              Welcome! Start your journey by reading a Surah.
            </p>

            <Link
              to="/surah/1"
              className="theme-button theme-button-gold mt-6"
            >
              Start with Al-Fatihah
            </Link>

          </div>
        )}


        {/* Reading history */}
        {!loading && user && lastRead && (
          <Link
            to={`/surah/${lastRead.surah_id}/${lastRead.verse_number}`}
            className="block"
          >

            <article
              className="
                theme-card
                group
                overflow-hidden
                cursor-pointer
              "
            >

              {/* Accent line */}
              <div
                className="
                  h-1
                  w-0
                  group-hover:w-full
                  transition-all
                  duration-500
                "
                style={{
                  background:
                    "var(--gradient-gold)",
                }}
              />

              <div
                className="
                  p-6
                  md:p-7
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-5
                "
              >

                <div className="flex items-center gap-5">

                  {/* Surah number */}
                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      shrink-0
                      bg-accent-soft
                      text-accent
                      font-black
                      text-xl
                      transition-all
                      group-hover:scale-105
                    "
                  >
                    {lastRead.surah_id}
                  </div>


                  {/* Details */}
                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <span className="text-xl font-black text-theme">
                        {lastRead.surah_name}
                      </span>

                      {lastRead.surah_name_arabic && (
                        <span
                          className="
                            text-2xl
                            font-arabic
                            leading-none
                            text-theme-secondary
                          "
                          dir="rtl"
                        >
                          {lastRead.surah_name_arabic}
                        </span>
                      )}

                    </div>

                    <p className="text-sm theme-muted mt-1">
                      Last read:
                      <span className="text-accent font-bold ml-1">
                        Verse {lastRead.verse_number}
                      </span>
                    </p>

                  </div>

                </div>


                {/* Continue */}
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-accent-soft
                    text-accent
                    font-bold
                    text-sm
                    group-hover:bg-accent
                    group-hover:text-white
                    transition-all
                  "
                >
                  <span>
                    Continue
                  </span>

                  <RiArrowRightSLine size={20} />
                </div>

              </div>

            </article>

          </Link>
        )}

      </div>

    </SectionWrapper>
  );
};

export default ContinueReading;