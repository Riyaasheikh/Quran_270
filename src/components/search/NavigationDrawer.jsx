import React, { useContext, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { ThemeContext } from "../../context/ThemeContext";

const NavigationDrawer = ({ isOpen, onClose, allChapters = [] }) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredChapters = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return allChapters;

    return allChapters.filter((ch) => {
      const idMatch = String(ch?.id || "") === q;
      const simpleMatch = (ch?.name_simple || "").toLowerCase().includes(q);
      const transMatch = (ch?.translated_name?.name || "")
        .toLowerCase()
        .includes(q);
      return idMatch || simpleMatch || transMatch;
    });
  }, [allChapters, filterText]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSelectChapter = (chapterId) => {
    setFilterText("");
    onClose?.();
    navigate(`/surah/${chapterId}`);
  };

  return createPortal(
    <div
      data-theme={theme}
      className="fixed inset-0 flex justify-start"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
      aria-label="Quran Surah Navigation"
    >
      {/* Dimmed Backdrop — rendered on document.body above SearchBar */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
        style={{ zIndex: 9999 }}
      />

      {/* Side Drawer Panel */}
      <aside
        className="relative w-[85vw] max-w-[340px] h-full flex flex-col shadow-2xl border-r border-theme bg-theme-card theme-text"
        style={{
          zIndex: 10000,
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-theme bg-theme-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-widest theme-accent">
              Navigate Surahs
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="p-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-80 theme-muted"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Filter Input */}
          <div className="relative">
            <RiSearchLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none theme-muted"
            />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search Surah..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-theme bg-theme-input theme-text outline-none"
              style={{ backgroundColor: "var(--bg-input)" }}
            />
          </div>
        </div>

        {/* Chapters List */}
        <div
          className="flex-1 overflow-y-auto px-2 py-2 space-y-1 bg-theme-card"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          {filteredChapters.map((chapter) => (
            <button
              type="button"
              key={chapter.id}
              onClick={() => handleSelectChapter(chapter.id)}
              className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-theme hover:bg-theme-soft"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-accent-soft theme-accent">
                  {chapter.id}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-bold truncate theme-text">
                    {chapter.name_simple}
                  </p>
                  <p className="text-xs truncate theme-muted">
                    {chapter?.translated_name?.name}
                  </p>
                </div>
              </div>

              <span
                dir="rtl"
                className="font-arabic text-lg shrink-0 theme-gold"
              >
                {chapter.name_arabic}
              </span>
            </button>
          ))}

          {filteredChapters.length === 0 && (
            <div className="py-10 text-center text-sm theme-muted">
              No matching Surah found.
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default NavigationDrawer;