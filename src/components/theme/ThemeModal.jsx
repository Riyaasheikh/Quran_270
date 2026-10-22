import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

const ThemeModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, themes } = useTheme();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5 border-b border-[var(--border)] pb-3">
          <h3 className="text-lg font-black text-[var(--text-main)]">Select Theme</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-[var(--bg-page)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="space-y-2.5">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                  isActive
                    ? "border-[var(--accent-gold)] bg-[var(--accent)]/15 font-bold shadow-sm"
                    : "border-[var(--border)] bg-[var(--bg-page)] hover:border-[var(--accent)]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: t.previewBg }}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: t.dot }} 
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-main)]">
                    {t.name}
                  </span>
                </div>
                {isActive && <RiCheckLine size={20} className="text-[var(--accent-gold)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;