import React, { useEffect, useRef, useState } from "react";
import SectionWrapper from "./SectionWrapper";
import { RiArrowLeftSLine, RiArrowRightSLine, RiLoader4Line } from "@remixicon/react";

const TOTAL_PAGES = 604;

const getImageUrl = (page) =>
  `http://localhost:8000/images/quran_page/${page}.png`;

export default function QuranViewer() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [jump, setJump] = useState("");
  const touchStartX = useRef(null);

  useEffect(() => {
    [page + 1, page - 1].filter((p) => p >= 1 && p <= TOTAL_PAGES).forEach((p) => {
      const img = new Image();
      img.src = getImageUrl(p);
    });
  }, [page]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page]);

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const goNext = () => page < TOTAL_PAGES && (setLoading(true), setPage((p) => p + 1));
  const goPrev = () => page > 1 && (setLoading(true), setPage((p) => p - 1));

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
      {/* Reduced py-2 to pt-0 pb-2 to snap content to the top */}
      <div className="flex flex-col items-center pt-0 pb-2 w-full">
        
        {/* PAGE INDICATOR - Tightened margin */}
        <div className="flex items-center justify-center mb-1 gap-3 text-[#8c7355] font-black text-xs uppercase tracking-widest opacity-80">
          <span>{page} / {TOTAL_PAGES}</span>
        </div>

        {/* MAIN VIEWER - Removed aspect-[2/3] to stop forced height gaps */}
        <div 
          className="relative w-full max-w-[550px] flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* LEFT ARROW */}
          <button
            onClick={goPrev}
            className="absolute left-2 md:-left-12 z-30 p-1 md:p-2 bg-[#8c7355] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
            aria-label="Previous Page"
          >
            <RiArrowLeftSLine size={23} />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={goNext}
            className="absolute -right-3 md:-right-12 z-30 p-1 md:p-2 bg-[#8c7355] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
            aria-label="Next Page"
          >
            <RiArrowRightSLine size={23} />
          </button>

          {/* IMAGE AREA - Changed to min-h to prevent massive empty space */}
          <div className="relative w-full min-h-[300px] flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <RiLoader4Line className="w-8 h-8 text-[#8c7355] animate-spin" />
              </div>
            )}
            
            <img
              key={page}
              src={getImageUrl(page)}
              alt={`Quran Page ${page}`}
              onLoad={() => setLoading(false)}
              className={`w-full h-auto max-h-[70vh] object-contain transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>
        </div>

        {/* JUMP CONTROL - Reduced mt to bring it closer to the image */}
        <div className="flex items-center gap-2 ">
          <input
            type="number"
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
            placeholder="Page.."
            className="w-16 py-1 text-normal text-center font-bold text-gray-700 bg-transparent border border-gray-300 rounded focus:border-[#8c7355] focus:outline-none transition-colors"
          />
          <button
            onClick={jumpToPage}
            className="text-[#8c7355] text-[14px] text-center border border-gray-300 px-3 py-1 font-black rounded uppercase tracking-widest hover:opacity-70"
          >
            Jump
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}