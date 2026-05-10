// components/quran/Sidebar.jsx
import { useState } from "react";
import { useChapters } from "../../hooks/useQuranData";

const Sidebar = ({ onSelectSurah, selectedId, isOpen, onClose }) => {
  const { data: chapters, isLoading } = useChapters();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = chapters?.filter((c) =>
    c.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toString() === searchTerm
  );

  return (
    <>
      {/* OVERLAY (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed lg:relative z-50 h-screen w-72
        bg-[var(--bg-card)]
        border-r border-[var(--border-subtle)]
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>

        {/* HEADER */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-bold text-lg mb-3">Qur'an</h2>

          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border rounded-md bg-transparent"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LIST */}
        <div className="overflow-y-auto h-full">
          {isLoading ? (
            <p className="p-4 text-sm opacity-50">Loading...</p>
          ) : (
            filtered?.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectSurah(c.id);
                  onClose(); // close on mobile
                }}
                className={`w-full flex justify-between px-4 py-3 text-left ${
                  selectedId === c.id
                    ? "bg-[var(--accent)]/10"
                    : "hover:bg-[var(--bg-page)]"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{c.name_simple}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.translated_name.name}
                  </p>
                </div>

                <span className="font-quran text-lg text-[var(--accent)]">
                  {c.name_arabic}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;