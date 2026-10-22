import React, { useState, useEffect } from "react";
import {
  RiBookmarkLine,
  RiBookmarkFill,
  RiShareLine,
  RiCheckLine,
  RiRestartLine,
  RiSearchLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSparklingFill,
  RiHeart3Line,
  RiBookOpenLine,
  RiTimeLine,
  RiVolumeUpLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import { DUA_CATEGORIES, DUAS_LIST, DHIKR_ITEMS } from "../data/supplicationsData";

const Supplications = () => {
  // Navigation Tabs: 'duas' | 'dhikr' | 'tasbih' | 'shukr'
  const [activeTab, setActiveTab] = useState("duas");

  // ================= DUA STATE =================
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [duaSearch, setDuaSearch] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("deen360_dua_favs") || "[]");
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState(null);

  // ================= TASBIH STATE =================
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_ITEMS[0]);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [totalRounds, setTotalRounds] = useState(0);

  // ================= SHUKR JOURNAL STATE =================
  const [shukrEntries, setShukrEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("deen360_shukr_journal") || "[]");
    } catch {
      return [];
    }
  });
  const [journalInput, setJournalInput] = useState("");
  const [journalMood, setJournalMood] = useState("Peaceful");

  // Save Favorites
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("deen360_dua_favs", JSON.stringify(next));
      return next;
    });
  };

  // Share Dua
  const handleShare = async (dua) => {
    const textToShare = `${dua.title}\n\n${dua.arabic}\n\n"${dua.english}"\n\nReference: ${dua.reference}\nShared via Deen 360`;
    if (navigator.share) {
      try {
        await navigator.share({ title: dua.title, text: textToShare });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(textToShare);
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Tasbih Count Logic
  const handleTasbihTap = () => {
    if (navigator.vibrate) navigator.vibrate(25); // Haptic feedback
    setTasbihCount((prev) => {
      const next = prev + 1;
      if (tasbihTarget !== Infinity && next >= tasbihTarget) {
        setTotalRounds((r) => r + 1);
        return 0;
      }
      return next;
    });
  };

  const resetTasbih = () => {
    setTasbihCount(0);
    setTotalRounds(0);
  };

  // Shukr Submit
  const handleAddShukr = (e) => {
    e.preventDefault();
    if (!journalInput.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: journalInput.trim(),
      mood: journalMood,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updated = [newEntry, ...shukrEntries];
    setShukrEntries(updated);
    localStorage.setItem("deen360_shukr_journal", JSON.stringify(updated));
    setJournalInput("");
  };

  const deleteShukr = (id) => {
    const updated = shukrEntries.filter((item) => item.id !== id);
    setShukrEntries(updated);
    localStorage.setItem("deen360_shukr_journal", JSON.stringify(updated));
  };

  // Filter Duas
  const filteredDuas = DUAS_LIST.filter((d) => {
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    const query = duaSearch.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(query) ||
      d.english.toLowerCase().includes(query) ||
      d.transliteration.toLowerCase().includes(query) ||
      d.urdu.includes(query) ||
      d.reference.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Banner */}
        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay py-12 px-4 sm:px-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
              <RiSparklingFill size={13} />
              <span>Phase 1 • Daily Companion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              Duas & Daily Remembrance
            </h1>
            <p className="theme-muted text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Strengthen your connection with the Creator through authentic supplications, digital dhikr, and gratitude reflection.
            </p>

            {/* Main Tabs Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "duas", label: "Dua Library", icon: "🤲" },
                { id: "dhikr", label: "Daily Dhikr", icon: "📿" },
                { id: "tasbih", label: "Digital Tasbih", icon: "🔢" },
                { id: "shukr", label: "Shukr Journal", icon: "📖" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-accent text-[var(--accent-foreground)] shadow-md shadow-accent/20"
                      : "theme-button-outline"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            TAB 1: DUA LIBRARY
           ========================================================= */}
        {activeTab === "duas" && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-300">
            {/* Search Bar & Categories Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="relative w-full md:w-80">
                <RiSearchLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-subtle" />
                <input
                  type="text"
                  placeholder="Search by topic, keyword, or reference..."
                  value={duaSearch}
                  onChange={(e) => setDuaSearch(e.target.value)}
                  className="theme-input pl-10 text-xs"
                />
              </div>

              {/* Category Pills List */}
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none">
                {DUA_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-accent text-[var(--accent-foreground)] font-bold"
                        : "bg-theme-soft theme-muted hover:theme-text border border-theme"
                    }`}
                  >
                    <span className="mr-1.5">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duas Stream Grid */}
            {filteredDuas.length === 0 ? (
              <div className="theme-card p-12 text-center border-dashed">
                <p className="text-base font-bold theme-text">No supplications found</p>
                <p className="text-xs theme-muted mt-1">Try another keyword or select "All Duas".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDuas.map((dua) => {
                  const isFav = favorites.includes(dua.id);

                  return (
                    <article
                      key={dua.id}
                      className="theme-card theme-card-lift p-6 flex flex-col justify-between gap-5 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-theme/60 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest theme-gold">
                            {DUA_CATEGORIES.find((c) => c.id === dua.category)?.label || "Daily Supplication"}
                          </span>
                          <h2 className="text-lg font-bold theme-text mt-0.5 tracking-tight">
                            {dua.title}
                          </h2>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleFavorite(dua.id)}
                            className="theme-icon-button theme-icon-button-sm"
                            aria-label="Save to favorites"
                            title="Favorite"
                          >
                            {isFav ? (
                              <RiBookmarkFill size={16} className="theme-accent" />
                            ) : (
                              <RiBookmarkLine size={16} />
                            )}
                          </button>

                          <button
                            onClick={() => handleShare(dua)}
                            className="theme-icon-button theme-icon-button-sm"
                            aria-label="Share Dua"
                            title="Share / Copy"
                          >
                            {copiedId === dua.id ? (
                              <RiCheckLine size={16} className="text-[var(--success)]" />
                            ) : (
                              <RiShareLine size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Typography */}
                      <p className="font-quran text-2xl sm:text-3xl text-right leading-loose theme-text" dir="rtl">
                        {dua.arabic}
                      </p>

                      {/* Transliteration */}
                      <p className="text-xs font-medium theme-accent italic leading-relaxed">
                        {dua.transliteration}
                      </p>

                      {/* Translations */}
                      <div className="space-y-2 border-t border-theme/40 pt-3">
                        <p className="text-sm theme-secondary leading-relaxed font-serif">
                          "{dua.english}"
                        </p>
                        <p className="text-xs theme-muted leading-relaxed font-arabic text-right" dir="rtl">
                          {dua.urdu}
                        </p>
                      </div>

                      {/* Reference Badge */}
                      <div className="flex items-center justify-between pt-3 border-t border-theme/40 text-[11px] font-semibold theme-subtle">
                        <span>Authentic Source:</span>
                        <span className="theme-text font-bold">{dua.reference}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* =========================================================
            TAB 2: DAILY DHIKR (Remembrance)
           ========================================================= */}
        {activeTab === "dhikr" && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DHIKR_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="theme-card theme-card-lift p-6 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between border-b border-theme/60 pb-3">
                    <span className="ayah-number font-bold text-xs">{item.target}×</span>
                    <h3 className="text-base font-bold theme-text">{item.name}</h3>
                  </div>

                  <p className="font-quran text-2xl text-right theme-text my-2" dir="rtl">
                    {item.arabic}
                  </p>

                  <div className="space-y-1">
                    <p className="text-xs theme-secondary italic leading-relaxed">
                      "{item.meaning}"
                    </p>
                    <p className="text-xs theme-muted text-right font-arabic" dir="rtl">
                      {item.urduMeaning}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-theme-soft border border-theme text-[11px] theme-muted leading-relaxed">
                    <strong className="theme-gold block mb-0.5">Virtue & Reward:</strong>
                    {item.reward}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDhikr(item);
                      setTasbihTarget(item.target);
                      setTasbihCount(0);
                      setActiveTab("tasbih");
                    }}
                    className="theme-button-outline w-full !py-2 text-xs font-bold gap-2 mt-2"
                  >
                    <span>Count in Digital Tasbih</span>
                  </button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* =========================================================
            TAB 3: DIGITAL TASBIH
           ========================================================= */}
        {activeTab === "tasbih" && (
          <main className="max-w-md mx-auto px-4 py-12 animate-in fade-in duration-300">
            <div className="theme-card p-8 rounded-3xl shadow-xl border border-theme text-center relative flex flex-col items-center">
              
              {/* Dhikr Selector Pill */}
              <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-theme">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider theme-gold">Active Remembrance</span>
                  <h3 className="text-lg font-bold theme-text">{selectedDhikr.name}</h3>
                </div>
                <button
                  onClick={resetTasbih}
                  className="theme-icon-button theme-icon-button-sm"
                  aria-label="Reset count"
                  title="Reset Counter"
                >
                  <RiRestartLine size={18} />
                </button>
              </div>

              {/* Arabic Presentation */}
              <p className="font-quran text-3xl theme-text mb-6" dir="rtl">
                {selectedDhikr.arabic}
              </p>

              {/* Target Controller Pills */}
              <div className="flex items-center gap-2 mb-8 bg-theme-soft p-1 rounded-xl border border-theme">
                {[33, 99, 100, Infinity].map((target) => (
                  <button
                    key={target}
                    onClick={() => {
                      setTasbihTarget(target);
                      setTasbihCount(0);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      tasbihTarget === target
                        ? "bg-accent text-[var(--accent-foreground)]"
                        : "theme-muted hover:theme-text"
                    }`}
                  >
                    {target === Infinity ? "∞ Free" : target}
                  </button>
                ))}
              </div>

              {/* Big Interactive Tap Counter Disk */}
              <button
                onClick={handleTasbihTap}
                className="w-52 h-52 rounded-full border-4 border-accent/30 bg-theme-card flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all select-none cursor-pointer group hover:border-accent"
                style={{
                  boxShadow: "0 20px 40px -15px color-mix(in srgb, var(--accent) 35%, transparent)",
                }}
              >
                <span className="text-xs uppercase tracking-[0.25em] theme-subtle font-bold mb-1">Count</span>
                <span className="text-6xl font-black theme-text tracking-tighter group-hover:scale-105 transition-transform">
                  {tasbihCount}
                </span>
                <span className="text-xs font-semibold theme-accent mt-2">
                  {tasbihTarget === Infinity ? "Tap to Count" : `/ Target ${tasbihTarget}`}
                </span>
              </button>

              {/* Completed Rounds Counter */}
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-theme w-full justify-around text-xs font-bold theme-muted">
                <div>
                  <span className="text-theme-subtle block text-[10px] uppercase">Rounds Finished</span>
                  <span className="text-sm font-extrabold theme-text">{totalRounds}</span>
                </div>
                <div>
                  <span className="text-theme-subtle block text-[10px] uppercase">Remaining</span>
                  <span className="text-sm font-extrabold theme-accent">
                    {tasbihTarget === Infinity ? "—" : Math.max(0, tasbihTarget - tasbihCount)}
                  </span>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* =========================================================
            TAB 4: SHUKR (Gratitude) JOURNAL
           ========================================================= */}
        {activeTab === "shukr" && (
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-300">
            {/* Journal Input Box */}
            <form onSubmit={handleAddShukr} className="theme-card p-6 rounded-2xl mb-8 border border-theme shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <RiHeart3Line className="theme-gold" size={20} />
                <h2 className="text-base font-bold theme-text">
                  Today I am grateful to Allah for...
                </h2>
              </div>

              <textarea
                rows={3}
                placeholder="Write a reflection or blessing that brought gratitude to your heart today..."
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                className="theme-input text-sm resize-none mb-4"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Mood Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs theme-subtle font-semibold">Mood:</span>
                  {["Peaceful", "Humbled", "Tested", "Content"].map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setJournalMood(mood)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        journalMood === mood
                          ? "bg-accent-soft text-accent border-accent font-bold"
                          : "border-theme theme-muted"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!journalInput.trim()}
                  className="theme-button !py-2 !px-4 text-xs font-bold gap-1.5 self-end sm:self-auto"
                >
                  <RiAddLine size={16} />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>

            {/* Past Entries Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest theme-subtle px-1">
                Reflections of Gratitude ({shukrEntries.length})
              </h3>

              {shukrEntries.length === 0 ? (
                <div className="theme-card p-10 text-center border-dashed">
                  <p className="text-sm font-semibold theme-text">No reflections recorded yet</p>
                  <p className="text-xs theme-muted mt-1">
                    "If you are grateful, I will surely increase you in favor." (Quran 14:7)
                  </p>
                </div>
              ) : (
                shukrEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="theme-card p-5 flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold theme-subtle flex items-center gap-1">
                          <RiTimeLine size={13} />
                          {entry.date}
                        </span>
                        <span className="theme-badge theme-badge-gold text-[10px] py-0.5 px-2">
                          {entry.mood}
                        </span>
                      </div>
                      <p className="text-sm theme-secondary leading-relaxed whitespace-pre-line">
                        {entry.text}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteShukr(entry.id)}
                      className="theme-icon-button theme-icon-button-sm text-subtle hover:!text-[var(--danger)] hover:!border-[var(--danger)]"
                      aria-label="Delete entry"
                    >
                      <RiDeleteBinLine size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Supplications;