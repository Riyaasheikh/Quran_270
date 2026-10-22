import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiMoonClearLine,
  RiSunLine,
  RiFireLine,
  RiCheckLine,
  RiCalendarLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSparklingFill,
  RiTimeLine,
  RiArrowRightLine,
  RiHourglassLine,
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

const FastingHub = () => {
  const [records, setRecords] = useState(getFastingRecords());
  const [fastType, setFastType] = useState(FAST_TYPES.RAMADAN);
  const [notes, setNotes] = useState("");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);

  // Dynamic Astronomical Timings from AlAdhan API
  const [timingsData, setTimingsData] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const isFastedToday = records.some((r) => r.date === todayStr && r.status === "completed");
  const streak = calculateFastingStreak(records);

  useEffect(() => {
    let lat = 31.5204;
    let lon = 74.3587;

    const fetchTimings = (latitude, longitude) => {
      const timestamp = Math.floor(Date.now() / 1000);
      fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.data) {
            setTimingsData(data.data.timings);
            setHijriDate(data.data.date.hijri);
          }
        })
        .catch((err) => console.error("Fasting Hub Timings error:", err))
        .finally(() => setLoading(false));
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

  const suhoorTime = timingsData?.Fajr?.split(" ")[0] || "04:30";
  const iftarTime = timingsData?.Maghrib?.split(" ")[0] || "18:15";

  const isRamadan = hijriDate?.month?.number === 9;
  const currentHijriDay = Number(hijriDate?.day || 1);
  const hijriYear = hijriDate?.year || "1448";

  const monthsUntilRamadan = isRamadan ? 0 : (9 - (hijriDate?.month?.number || 1) + 12) % 12;
  const daysUntilRamadan = isRamadan ? 0 : Math.max(1, monthsUntilRamadan * 30 - currentHijriDay);

  const sunnahBadges = getVoluntaryFastingBadges(currentHijriDay);

  const handleToggleToday = () => {
    const updated = toggleTodayFast(suhoorTime, iftarTime);
    setRecords(updated);
  };

  const handleAddManualFast = (e) => {
    e.preventDefault();
    if (!customDate) return;

    const record = {
      id: Date.now(),
      date: customDate,
      type: fastType,
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
              Track Ramadan progress, make up missed fasts (Qadha), and maintain Sunnah fasts with accurate solar dawn and dusk times.
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
                <span key={idx} className="theme-badge theme-badge-accent text-[11px] font-bold py-1.5 px-3">
                  🌙 {badge} Today
                </span>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Main Today's Card */}
          <div className="theme-card p-6 sm:p-8 rounded-3xl border border-theme shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wider theme-gold block mb-1">
                  {isRamadan
                    ? `Holy Month of Ramadan ${hijriYear}`
                    : `${hijriDate?.month?.en || "Islamic Calendar"} ${hijriYear} AH`}
                </span>

                {isRamadan ? (
                  <h2 className="text-2xl sm:text-3xl font-extrabold theme-text">
                    Day {currentHijriDay} <span className="theme-muted text-base font-normal">/ 30 Days</span>
                  </h2>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold theme-text flex items-center justify-center md:justify-start gap-2">
                      <RiHourglassLine size={24} className="theme-gold" />
                      <span>~{daysUntilRamadan} Days Until Ramadan</span>
                    </h2>
                    <p className="text-xs theme-muted">Sunnah & Voluntary Fasting Window</p>
                  </div>
                )}

                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold theme-gold">
                    <RiFireLine size={16} />
                    <span>{streak} Day Active Streak</span>
                  </span>
                </div>
              </div>

              {/* Suhoor & Iftar Live Clocks */}
              <div className="flex items-center gap-4">
                <div className="text-center p-3.5 px-5 rounded-2xl bg-theme-soft border border-theme">
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                    Suhoor (Fajr)
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono theme-text">
                    {suhoorTime}
                  </span>
                </div>

                <div className="text-center p-3.5 px-5 rounded-2xl bg-accent-soft/40 border border-accent/30">
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-accent">
                    Iftar (Maghrib)
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono theme-accent">
                    {iftarTime}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleToday}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isFastedToday
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button"
                }`}
              >
                <RiCheckLine size={18} />
                <span>{isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}</span>
              </button>
            </div>
          </div>

          {/* Log Any Fast (Qadha, Sunnah, Voluntary) */}
          <form onSubmit={handleAddManualFast} className="theme-card p-6 sm:p-7 rounded-2xl border border-theme space-y-4">
            <h3 className="text-sm font-bold theme-text uppercase tracking-wider flex items-center gap-2">
              <RiCalendarLine size={18} className="theme-gold" />
              <span>Log A Fast / Qadha Makeup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="theme-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">Type of Fast</label>
                <select
                  value={fastType}
                  onChange={(e) => setFastType(e.target.value)}
                  className="theme-input text-xs cursor-pointer"
                >
                  {Object.values(FAST_TYPES).map((type) => (
                    <option key={type} value={type} className="bg-theme-card theme-text">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-secondary mb-1">Notes / Intent (Optional)</label>
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
              <button type="submit" className="theme-button !py-2 text-xs font-bold gap-1.5">
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
                <p className="text-sm font-semibold theme-text">No recorded fasts yet</p>
                <p className="text-xs theme-muted mt-1">
                  Mark today's fast above or log past Qadha fasts to start building your streak.
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {records.map((r) => (
                  <div key={r.date} className="theme-card p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold theme-text">{r.date}</span>
                          <span className="theme-badge theme-badge-gold text-[10px] py-0 px-2">
                            {r.type}
                          </span>
                        </div>
                        {r.notes && <p className="text-xs theme-muted mt-0.5">{r.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono theme-subtle hidden sm:inline-block">
                        {r.suhoor_time} - {r.iftar_time}
                      </span>
                      <button
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