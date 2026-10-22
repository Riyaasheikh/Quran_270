import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import SectionWrapper from "./SectionWrapper";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLoader4Line,
} from "@remixicon/react";

const TOTAL_PAGES = 604;

const getImageUrl = (page) =>
  `http://localhost:8000/images/quran_page/${page}.png`;

export default function QuranViewer() {

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [jump, setJump] = useState("");

  const touchStartX = useRef(null);


  /* -------------------------------------------------------
     PRELOAD ADJACENT PAGES
     ------------------------------------------------------- */

  useEffect(() => {

    const pages = [
      page - 1,
      page + 1,
    ].filter(
      (currentPage) =>
        currentPage >= 1 &&
        currentPage <= TOTAL_PAGES
    );

    pages.forEach((currentPage) => {
      const image = new Image();
      image.src = getImageUrl(currentPage);
    });

  }, [page]);


  /* -------------------------------------------------------
     KEYBOARD NAVIGATION
     ------------------------------------------------------- */

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (event.key === "ArrowLeft") {
        goNext();
      }

      if (event.key === "ArrowRight") {
        goPrev();
      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [page]);


  /* -------------------------------------------------------
     TOUCH NAVIGATION
     ------------------------------------------------------- */

  const onTouchStart = (event) => {
    touchStartX.current =
      event.touches[0].clientX;
  };


  const onTouchEnd = (event) => {

    if (touchStartX.current === null) {
      return;
    }

    const endX =
      event.changedTouches[0].clientX;

    const difference =
      touchStartX.current - endX;

    touchStartX.current = null;

    if (Math.abs(difference) < 50) {
      return;
    }

    if (difference > 0) {
      goNext();
    } else {
      goPrev();
    }

  };


  /* -------------------------------------------------------
     PAGE NAVIGATION
     ------------------------------------------------------- */

  const goNext = () => {

    if (page >= TOTAL_PAGES) {
      return;
    }

    setLoading(true);
    setPage((current) => current + 1);
  };


  const goPrev = () => {

    if (page <= 1) {
      return;
    }

    setLoading(true);
    setPage((current) => current - 1);
  };


  /* -------------------------------------------------------
     JUMP
     ------------------------------------------------------- */

  const jumpToPage = () => {

    const requestedPage =
      Number.parseInt(jump, 10);

    if (
      Number.isInteger(requestedPage) &&
      requestedPage >= 1 &&
      requestedPage <= TOTAL_PAGES
    ) {
      setLoading(true);
      setPage(requestedPage);
      setJump("");
    }

  };


  return (
    <SectionWrapper>

      <div
        className="
          w-full
          flex
          flex-col
          items-center
          pt-1
          pb-4
        "
      >

        {/* Page counter */}
        <div className="mb-3">

          <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">
            Page {page}
            <span className="theme-subtle mx-2">
              /
            </span>
            {TOTAL_PAGES}
          </span>

        </div>


        {/* Viewer */}
        <div
          className="
            relative
            w-full
            max-w-[620px]
            flex
            items-center
            justify-center
          "
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >

          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={page === 1}
            className="
              absolute
              left-1
              md:-left-14
              z-30
              w-10
              h-10
              md:w-11
              md:h-11
              rounded-full
              flex
              items-center
              justify-center
              bg-theme-card
              border
              border-theme
              text-theme
              shadow-lg
              hover:text-accent
              hover:border-theme-strong
              hover:scale-110
              disabled:opacity-30
              disabled:pointer-events-none
              transition-all
            "
            aria-label="Previous page"
          >
            <RiArrowLeftSLine size={23} />
          </button>


          {/* Next */}
          <button
            onClick={goNext}
            disabled={page === TOTAL_PAGES}
            className="
              absolute
              right-1
              md:-right-14
              z-30
              w-10
              h-10
              md:w-11
              md:h-11
              rounded-full
              flex
              items-center
              justify-center
              bg-theme-card
              border
              border-theme
              text-theme
              shadow-lg
              hover:text-accent
              hover:border-theme-strong
              hover:scale-110
              disabled:opacity-30
              disabled:pointer-events-none
              transition-all
            "
            aria-label="Next page"
          >
            <RiArrowRightSLine size={23} />
          </button>


          {/* Image */}
          <div
            className="
              relative
              w-full
              min-h-[300px]
              flex
              items-center
              justify-center
              rounded-2xl
              overflow-hidden
              bg-theme-card
              border
              border-theme
              shadow-xl
            "
          >

            {loading && (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  z-10
                  bg-theme-card
                "
              >
                <RiLoader4Line
                  size={34}
                  className="text-accent animate-spin"
                />
              </div>
            )}

            <img
              key={page}
              src={getImageUrl(page)}
              alt={`Quran page ${page}`}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              className={`
                w-full
                h-auto
                max-h-[76vh]
                object-contain
                transition-opacity
                duration-300
                ${
                  loading
                    ? "opacity-0"
                    : "opacity-100"
                }
              `}
              draggable="false"
            />

          </div>

        </div>


        {/* Jump controls */}
        <div className="flex items-center gap-2 mt-4">

          <input
            type="number"
            min="1"
            max={TOTAL_PAGES}
            value={jump}
            onChange={(event) =>
              setJump(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                jumpToPage();
              }
            }}
            placeholder="Page"
            aria-label="Page number"
            className="
              theme-input
              w-20
              py-2
              px-2
              text-center
              text-sm
              font-bold
            "
          />

          <button
            onClick={jumpToPage}
            className="
              theme-button-outline
              text-xs
              uppercase
              tracking-[0.15em]
            "
          >
            Jump
          </button>

        </div>

      </div>

    </SectionWrapper>
  );
}