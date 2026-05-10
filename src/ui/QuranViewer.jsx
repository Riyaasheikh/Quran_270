import React, { useEffect, useRef, useState } from "react";
import SectionWrapper from "./SectionWrapper";

const TOTAL_PAGES = 604;

const getImageUrl = (page) =>
  `http://localhost:8000/images/quran_page/${page}.png`;

export default function QuranViewer() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [jump, setJump] = useState("");

  const touchStartX = useRef(null);

  // Preload next/prev pages
  useEffect(() => {
    [page + 1, page + 2, page - 1]
      .filter((p) => p >= 1 && p <= TOTAL_PAGES)
      .forEach((p) => {
        const img = new Image();
        img.src = getImageUrl(p);
      });
  }, [page]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page]);

  // Touch support (swipe)
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const goNext = () => {
    if (page < TOTAL_PAGES) {
      setLoading(true);
      setPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (page > 1) {
      setLoading(true);
      setPage((p) => p - 1);
    }
  };

  const jumpToPage = () => {
    const p = parseInt(jump);
    if (p >= 1 && p <= TOTAL_PAGES) {
      setLoading(true);
      setPage(p);
      setJump("");
    }
  };

  return (
    <SectionWrapper>

    
    <div
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* PAGE IMAGE */}
      <img
        key={page}
        src={getImageUrl(page)}
        alt={`Quran Page ${page}`}
        onLoad={() => setLoading(false)}
        className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#8c7355] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-sm text-gray-300">Loading page {page}...</p>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="absolute text-center   top-0 left-145 w-full flex justify-between items-center text-black  backdrop-blur-md">
        <span className="text-medium mb-4 font-bold">
          {page} / {TOTAL_PAGES}
        </span>
      </div>

      {/* NAV BUTTONS */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl bg-[#8c7355] px-3 py-2 rounded-full hover:bg-black/60 transition"
      >
        ‹
      </button>

      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl bg-[#8c7355] px-3 py-2 rounded-full hover:bg-black/60 transition"
      >
        ›
      </button>

      {/* JUMP CONTROL */}
      <div className="absolute pb-0 bottom-0 left-1/2 -translate-x-1/2 flex gap-2  p-2 rounded-xl ">
        <input
          type="number"
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
          placeholder="Page"
          className="w-30 text-center  text-black  border border-[#8c7355] rounded-lg focus:outline-none "
        />
        <button
          onClick={jumpToPage}
          className="bg-[#bfa07d] text-black px-3 py-1 border border-[#8c7355] rounded-lg focus:outline-none  font-bold"
        >
          Go
        </button>
      </div>
    </div>
    </SectionWrapper>
  );
}