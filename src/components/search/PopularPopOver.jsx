import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { RiCloseLine, RiFireLine } from "@remixicon/react";
import { ThemeContext } from "../../context/ThemeContext";

const PopularPopOver = ({ onClose }) => {
  const { theme } = useContext(ThemeContext);

  const popularLinks = [
    { name: "Surah Yaseen", path: "/surah/36", desc: "Heart of Quran" },
    { name: "Surah Al-Mulk", path: "/surah/67", desc: "The Sovereignty" },
    { name: "Surah Al-Kahf", path: "/surah/18", desc: "The Cave" },
    { name: "Surah Ar-Rahman", path: "/surah/55", desc: "The Most Merciful" },
    { name: "Surah Al-Waqi'ah", path: "/surah/56", desc: "The Inevitable" },
  ];

  return (
    <div
      data-theme={theme}
      className="absolute top-full left-0 mt-2.5 w-[290px] sm:w-[310px] border border-theme bg-theme-card theme-text shadow-2xl rounded-2xl z-[150] overflow-hidden"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-theme bg-theme-soft flex items-center justify-between">
        <div className="flex items-center gap-2 theme-accent">
          <RiFireLine size={18} />
          <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            Quick Access
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Popular menu"
          className="p-1 rounded-lg transition-colors cursor-pointer theme-muted hover:theme-text"
        >
          <RiCloseLine size={18} />
        </button>
      </div>

      {/* Links */}
      <div
        className="p-2 overflow-y-auto max-h-[380px] space-y-1 bg-theme-card"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {popularLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={onClose}
            className="flex flex-col px-3.5 py-2.5 rounded-xl transition-all group border border-transparent hover:border-theme hover:bg-theme-soft"
          >
            <span className="text-sm sm:text-[15px] font-bold theme-text group-hover:theme-accent transition-colors">
              {link.name}
            </span>
            <span className="text-xs font-medium mt-0.5 theme-muted">
              {link.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularPopOver;