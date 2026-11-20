import React, { useState, useEffect, useRef, useContext } from "react";
import { RiArrowRightUpBoxLine, RiListUnordered } from "@remixicon/react";
import PopularPopOver from "./PopularPopOver";
import NavigationDrawer from "./NavigationDrawer";
import { ThemeContext } from "../../context/ThemeContext";

const QuickActions = ({ allChapters = [] }) => {
  const { theme } = useContext(ThemeContext);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPopOpen, setIsPopOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popRef.current && !popRef.current.contains(event.target)) {
        setIsPopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      data-theme={theme}
      className="flex flex-wrap items-center justify-start w-full gap-3 relative z-20"
    >
      {/* Navigate Quran Button */}
      <button
        type="button"
        onClick={() => {
          setIsPopOpen(false);
          setIsNavOpen(true);
        }}
        className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center sm:justify-start gap-2.5 px-5 sm:px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group border border-theme bg-theme-card theme-text"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <RiListUnordered
          size={18}
          className="transition-transform group-hover:rotate-12 theme-gold"
        />
        <span className="font-bold text-sm sm:text-base whitespace-nowrap">
          Navigate Quran
        </span>
      </button>

      {/* Popular Popover Trigger + Menu */}
      <div className="relative flex-1 sm:flex-initial" ref={popRef}>
        <button
          type="button"
          onClick={() => setIsPopOpen((prev) => !prev)}
          aria-expanded={isPopOpen}
          className={`w-full min-h-[44px] flex items-center justify-center sm:justify-start gap-2.5 px-5 sm:px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group border ${
            isPopOpen
              ? "bg-gold border-gold"
              : "bg-theme-card border-theme theme-text"
          }`}
          style={{
            backgroundColor: isPopOpen ? "var(--gold)" : "var(--bg-card)",
          }}
        >
          <RiArrowRightUpBoxLine
            size={18}
            className={isPopOpen ? "" : "theme-gold"}
          />
          <span className="font-bold text-sm sm:text-base whitespace-nowrap">
            Popular
          </span>
        </button>

        {isPopOpen && (
          <PopularPopOver onClose={() => setIsPopOpen(false)} />
        )}
      </div>

      {/* Navigation Drawer (z-[200] covers SearchBar z-20) */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        allChapters={allChapters}
      />
    </div>
  );
};

export default QuickActions;