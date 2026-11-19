import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiFireLine,
  RiCheckLine,
  RiCalendarLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSparklingFill,
  RiTimeLine,
  RiHourglassLine,
  RiLockLine,
  RiBookOpenLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import {
  getFastingRecords,
  saveFastingRecord,
  toggleTodayFast,
  calculateFastingStreak,
  getVoluntaryFastingBadges,
  FAST_TYPES,
} from "../utils/fastingUtils";

const RAMADAN_DUAS = {
  sehri: {
    title: "Sehri Dua (Niyyah for Fasting)",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    translation:
      "I intend to keep the fast for tomorrow in the month of Ramadan.",
  },
  iftari: {
    title: "Iftari Dua (Breaking the Fast)",
    arabic:
      "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    translation:
      "O Allah, I fasted for You, I believe in You, I put my trust in You, and I break my fast with Your sustenance.",
  },
  duringRamadan: {
    title: "Supplication During Ramadan",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    translation:
      "O Allah, You are Forgiving and Generous, and You love forgiveness, so forgive me.",
  },
};

const ASHRA_DUAS = [
  {
    id: "ashra-1",
    tabLabel: "Days 1–10 (Mercy)",
    title: "First 10 Days — Rahmah (Mercy)",
    arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ",
    translation:
      "My Lord, forgive and have mercy, and You are the Best of the merciful.",
  },
  {
    id: "ashra-2",
    tabLabel: "Days 11–20 (Forgiveness)",
    title: "Middle 10 Days — Maghfirah (Forgiveness)",
    arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ",
    translation:
      "I seek forgiveness from Allah, my Lord, for every sin, and I turn to Him in repentance.",
  },
  {
    id: "ashra-3",
    tabLabel: "Days 21–30 (Salvation)",
    title: "Last 10 Days — Najaat (Salvation from Fire)",
    arabic: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ",
    translation: "O Allah, save me from the Fire.",
  },
];

const FastingHub = () => {
  const [records, setRecords] = useState(getFastingRecords);
  const [fastType, setFastType] = useState(
    FAST_TYPES.MISSED_QADHA || FAST_TYPES.QADHA || "Missed / Qadha Makeup"
  );
  const [notes, setNotes] = useState("");
  const [customDate, setCustomDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  // Dynamic Astronomical Timings from AlAdhan API
  const [timingsData, setTimingsData] = useState(null);
  const [tomorrowTimings, setTomorrowTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [exactDaysUntilRamadan, setExactDaysUntilRamadan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  // Dua state
  const [activeDuaTab, setActiveDuaTab] = useState("sehri");
  const [selectedAshraIdx, setSelectedAshraIdx] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const todayStr = now.toISOString().split("T")[0];
  const isFastedToday = records.some(
    (r) => r.date === todayStr && r.status === "completed"
  );
  const streak = calculateFastingStreak(records);

  useEffect(() => {
    const lat = 31.5204;
    const lon = 74.3587;

    const fetchTimings = async (latitude, longitude) => {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const tomorrowTs = timestamp + 86400;

        const [res, tomorrowRes] = await Promise.all([
          fetch(
            `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`
          ).then((r) => r.json()),
          fetch(
            `https://api.aladhan.com/v1/timings/${tomorrowTs}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`
          ).then((r) => r.json()),
        ]);

        if (res?.data) {
          const hDate = res.data.date.hijri;
          setTimingsData(res.data.timings);
          setHijriDate(hDate);

          const dayNum = Number(hDate?.day || 1);
          setSelectedAshraIdx(dayNum <= 10 ? 0 : dayNum <= 20 ? 1 : 2);

          if (Number(hDate?.month?.number) === 9) {
            setFastType(FAST_TYPES.RAMADAN);
          } else {
            const targetYear =
              Number(hDate.month.number) > 9
                ? Number(hDate.year) + 1
                : Number(hDate.year);
            const ramadanRes = await fetch(
              `https://api.aladhan.com/v1/hToG/01-09-${targetYear}`
            ).then((r) => r.json());

            if (ramadanRes?.data?.gregorian?.date) {
              const [dd, mm, yyyy] = ramadanRes.data.gregorian.date
                .split("-")
                .map(Number);
              const ramadanStart = new Date(yyyy, mm - 1, dd);
              const todayMidnight = new Date();
              todayMidnight.setHours(0, 0, 0, 0);
              const diffDays = Math.max(
                1,
                Math.round(
                  (ramadanStart - todayMidnight) / (1000 * 60 * 60 * 24)
                )
              );
              setExactDaysUntilRamadan(diffDays);
            }
          }
        }

        if (tomorrowRes?.data) {
          setTomorrowTimings(tomorrowRes.data.timings);
        }
      } catch (err) {
        console.error("Fasting Hub Timings error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimings(pos.coords.latitude, pos.coords.longitude),
        () => fetchTimings(lat, lon),
        { timeout: 8000 }
      );
    } else {
      fetchTimings(lat, lon);
    }
  }, []);

  const parsePrayerTime = (timeStr, addDays = 0) => {
    if (!timeStr) return new Date(now);
    const [h, m] = timeStr.split(" ")[0].split(":").map(Number);
    const d = new Date(now);
    d.setDate(d.getDate() + addDays);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatDuration = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSec % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const rawFajr = timingsData?.Fajr || "04:30";
  const rawMaghrib = timingsData?.Maghrib || "18:15";
  const fajrToday = parsePrayerTime(rawFajr);
  const maghribToday = parsePrayerTime(rawMaghrib);
  const isAfterMaghrib = now >= maghribToday;
  const isBeforeFajr = now < fajrToday;

  const suhoorTime = isAfterMaghrib
    ? tomorrowTimings?.Fajr?.split(" ")[0] || rawFajr.split(" ")[0]
    : rawFajr.split(" ")[0];
  const iftarTime = rawMaghrib.split(" ")[0];

  let phaseLabel = "Next Suhoor In";
  let countdownText = formatDuration(
    (isBeforeFajr
      ? fajrToday
      : parsePrayerTime(suhoorTime, isAfterMaghrib ? 1 : 0)) - now
  );

  if (!isBeforeFajr && !isAfterMaghrib) {
    phaseLabel = "Iftar Countdown";
    countdownText = formatDuration(maghribToday - now);
  }

  const isRamadan = Number(hijriDate?.month?.number) === 9;
  const currentHijriDay = Number(hijriDate?.day || 1);
  const hijriYear = hijriDate?.year || "1448";

  const fallbackDays = Math.max(
    1,
    ((9 - (hijriDate?.month?.number || 1) + 12) % 12) * 30 - currentHijriDay
  );
  const daysUntilRamadan = exactDaysUntilRamadan ?? fallbackDays;

  const sunnahBadges = getVoluntaryFastingBadges(currentHijriDay);

  const handleToggleToday = () => {
    if (!isRamadan) return;
    const updated = toggleTodayFast(suhoorTime, iftarTime, FAST_TYPES.RAMADAN);
    setRecords(updated);
  };

  const handleAddManualFast = (e) => {
    e.preventDefault();
    if (!customDate) return;

    const safeType =
      !isRamadan && fastType === FAST_TYPES.RAMADAN
        ? FAST_TYPES.MISSED_QADHA || "Missed / Qadha Makeup"
        : fastType;

    const record = {
      id: Date.now(),
      date: customDate,
      type: safeType,
      status: "completed",
      suhoor_time: suhoorTime,
      iftar_time: iftarTime,
      notes: notes.trim(),
    };

    const updated = saveFastingRecord(record);
    setRecords(updated);
    setNotes("");
  };

  const handleDeleteRecord = (date) => {
    const updated = records.filter((r) => r.date !== date);
    localStorage.setItem("deen360_fasting_records", JSON.stringify(updated));
    setRecords(updated);
  };

  const currentDua =
    activeDuaTab === "ashra" ? ASHRA_DUAS[selectedAshraIdx] : RAMADAN_DUAS[activeDuaTab];

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay py-12 px-4 sm:px-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
              <RiSparklingFill size={13} />
              <span>Fasting & Ramadan Companion</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              Ramadan & Fasting Tracker
            </h1>
            <p className="theme-muted text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Track Ramadan progress, make up missed fasts (Qadha), and maintain
              Sunnah fasts with accurate solar dawn and dusk times.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <Link
                to="/prayer-times"
                className="theme-button-outline flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              >
                <RiTimeLine size={15} />
                <span>View Full Prayer Timings</span>
              </Link>

              {sunnahBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="theme-badge theme-badge-accent text-[11px] font-bold py-1.5 px-3"
                >
                  🌙 {badge} Today
                </span>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Main Today's Card */}
          <div className="theme-card p-6 sm:p-8 rounded-3xl border border-theme shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-start">
                <span className="text-xs font-bold uppercase tracking-wider theme-gold block mb-1">
                  {loading
                    ? "Syncing Hijri Calendar..."
                    : isRamadan
                    ? `Holy Month of Ramadan ${hijriYear}`
                    : `${hijriDate?.month?.en || "Islamic Calendar"} ${hijriYear} AH`}
                </span>

                {isRamadan ? (
                  <h2 className="text-2xl sm:text-3xl font-extrabold theme-text">
                    Day {currentHijriDay}{" "}
                    <span className="theme-muted text-base font-normal">
                      / 30 Days
                    </span>
                  </h2>
                ) : (
                  <div className="space-y-1">
                    <h2
                      dir="ltr"
                      className="text-2xl sm:text-3xl font-extrabold theme-text inline-flex items-center justify-center md:justify-start gap-2"
                    >
                      <RiHourglassLine size={24} className="theme-gold shrink-0" />
                      <span>{daysUntilRamadan} Days Until Ramadan</span>
                    </h2>
                    <p className="text-xs theme-muted">
                      Sunnah & Voluntary Fasting Window
                    </p>
                  </div>
                )}

                {isRamadan && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold theme-gold">
                      <RiFireLine size={16} />
                      <span>{streak} Day Active Streak</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Suhoor, Iftar & Live Countdown */}
              <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3">
                <div className="text-center p-3.5 px-4 rounded-2xl bg-theme-soft border border-theme">
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                    {isAfterMaghrib ? "Tomorrow Suhoor" : "Suhoor (Fajr)"}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono theme-text">
                    {suhoorTime}
                  </span>
                </div>

                <div className="text-center p-3.5 px-4 rounded-2xl bg-accent-soft/40 border border-accent/30">
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-accent">
                    Iftar (Maghrib)
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono theme-accent">
                    {iftarTime}
                  </span>
                </div>

                <div className="text-center p-3.5 px-4 rounded-2xl bg-theme-soft border border-theme">
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-gold">
                    {phaseLabel}
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono theme-text">
                    {countdownText}
                  </span>
                </div>
              </div>

              {/* Daily Fast Check-in (Only Active During Ramadan) */}
              {isRamadan ? (
                <button
                  type="button"
                  onClick={handleToggleToday}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isFastedToday
                      ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                      : "theme-button"
                  }`}
                >
                  <RiCheckLine size={18} />
                  <span>
                    {isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-theme bg-theme-soft text-xs font-semibold theme-muted">
                  <RiLockLine size={16} className="theme-gold shrink-0" />
                  <span>Daily Check-in Opens in Ramadan</span>
                </div>
              )}
            </div>

            {/* Ramadan Duas Section (Sehri, Iftari, During Ramadan, Each 10 Days) */}
            <div className="pt-5 border-t border-theme/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider theme-gold flex items-center gap-1.5">
                  <RiBookOpenLine size={15} />
                  <span>Ramadan & Ashra Duas</span>
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "sehri", label: "Sehri Dua" },
                    { id: "iftari", label: "Iftari Dua" },
                    { id: "duringRamadan", label: "During Ramadan" },
                    { id: "ashra", label: "Each 10 Days" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDuaTab(tab.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        activeDuaTab === tab.id
                          ? "bg-accent text-[var(--accent-foreground)]"
                          : "bg-theme-soft border border-theme theme-muted hover:theme-text"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeDuaTab === "ashra" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ASHRA_DUAS.map((ashra, idx) => (
                    <button
                      key={ashra.id}
                      type="button"
                      onClick={() => setSelectedAshraIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                        selectedAshraIdx === idx
                          ? "bg-accent-soft text-accent border border-accent/40"
                          : "bg-theme-soft border border-theme theme-secondary"
                      }`}
                    >
                      {ashra.tabLabel}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-theme-soft/75 border border-theme space-y-1.5">
                <span className="text-xs font-bold theme-accent block">
                  {currentDua.title}
                </span>
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-xl sm:text-2xl leading-loose text-right font-quran theme-text"
                >
                  {currentDua.arabic}
                </p>
                <p className="text-xs sm:text-sm theme-secondary leading-relaxed">
                  {currentDua.translation}
                </p>
              </div>
            </div>
          </div>

          {/* Log Any Fast (Qadha, Sunnah, Voluntary) */}
          <form
            onSubmit={handleAddManualFast}
            className="theme-card p-6 sm:p-7 rounded-2xl border border-theme space-y-4"
          >
            <h3 className="text-sm font-bold theme-text uppercase tracking-wider flex items-center gap-2">
              <RiCalendarLine size={18} className="theme-gold" />
              <span>Log A Fast / Qadha Makeup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="theme-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">
                  Type of Fast
                </label>
                <select
                  value={fastType}
                  onChange={(e) => setFastType(e.target.value)}
                  className="theme-input text-xs cursor-pointer"
                >
                  {Object.values(FAST_TYPES)
                    .filter((type) => isRamadan || type !== FAST_TYPES.RAMADAN)
                    .map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-theme-card theme-text"
                      >
                        {type}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">
                  Notes / Intent (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Qadha for Ramadan day 4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="theme-input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="theme-button !py-2 text-xs font-bold gap-1.5"
              >
                <RiAddLine size={16} />
                <span>Record Completed Fast</span>
              </button>
            </div>
          </form>

          {/* History of Completed Fasts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest theme-subtle px-1">
              Your Fasting Ledger ({records.length})
            </h3>

            {records.length === 0 ? (
              <div className="theme-card p-10 text-center border-dashed">
                <p className="text-sm font-semibold theme-text">
                  No recorded fasts yet
                </p>
                <p className="text-xs theme-muted mt-1">
                  {isRamadan
                    ? "Mark today's fast above or log past Qadha fasts to start building your streak."
                    : "Log past Qadha or voluntary Sunnah fasts above to maintain your ledger."}
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {records.map((r) => (
                  <div
                    key={r.date}
                    className="theme-card p-4 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold theme-text">
                            {r.date}
                          </span>
                          <span className="theme-badge theme-badge-gold text-[10px] py-0 px-2">
                            {r.type}
                          </span>
                        </div>
                        {r.notes && (
                          <p className="text-xs theme-muted mt-0.5">
                            {r.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        dir="ltr"
                        className="text-xs font-mono theme-subtle hidden sm:inline-block"
                      >
                        {r.suhoor_time} - {r.iftar_time}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(r.date)}
                        className="theme-icon-button theme-icon-button-sm text-subtle hover:!text-[var(--danger)] hover:!border-[var(--danger)]"
                        aria-label="Remove record"
                      >
                        <RiDeleteBinLine size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FastingHub;