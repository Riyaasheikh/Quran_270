import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiMoonClearLine,
  RiSunLine,
  RiTimeLine,
  RiFireLine,
  RiCheckLine,
  RiArrowRightLine,
  RiHourglassLine,
  RiCompass3Line,
} from "@remixicon/react";
import {
  getFastingRecords,
  toggleTodayFast,
  calculateFastingStreak,
} from "../../utils/fastingUtils";
import SectionWrapper from "../../ui/SectionWrapper";

const FastingHomeCard = () => {
  const [timings, setTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(getFastingRecords());
  const [currentPrayer, setCurrentPrayer] = useState("");

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
            setTimings(data.data.timings);
            setHijriDate(data.data.date.hijri);
            determineCurrentPrayer(data.data.timings);
          }
        })
        .catch((err) => console.error("Fasting Home Card error:", err))
        .finally(() => setLoading(false));
    };

    const determineCurrentPrayer = (t) => {
      const now = new Date();
      const parse = (str) => {
        const [h, m] = str.split(" ")[0].split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      };

      const prayerOrder = [
        { name: "Fajr", time: parse(t.Fajr) },
        { name: "Sunrise", time: parse(t.Sunrise) },
        { name: "Dhuhr", time: parse(t.Dhuhr) },
        { name: "Asr", time: parse(t.Asr) },
        { name: "Maghrib", time: parse(t.Maghrib) },
        { name: "Isha", time: parse(t.Isha) },
      ];

      let current = "Isha (Night)";
      for (let i = 0; i < prayerOrder.length; i++) {
        if (now >= prayerOrder[i].time) {
          current = prayerOrder[i].name;
        }
      }
      setCurrentPrayer(current);
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

  if (loading || !timings) return null;

  const suhoorTime = timings.Fajr?.split(" ")[0] || "04:30";
  const iftarTime = timings.Maghrib?.split(" ")[0] || "18:15";

  const isRamadan = hijriDate?.month?.number === 9;
  const hijriYear = hijriDate?.year || "1448";
  const currentHijriDay = hijriDate?.day || 1;

  const monthsUntilRamadan = isRamadan ? 0 : (9 - (hijriDate?.month?.number || 1) + 12) % 12;
  const daysUntilRamadan = isRamadan ? 0 : Math.max(1, monthsUntilRamadan * 30 - Number(currentHijriDay));

  const handleToggle = () => {
    const updated = toggleTodayFast(suhoorTime, iftarTime);
    setRecords(updated);
  };

  return (
    <SectionWrapper>
      <div className="theme-card p-12 flex flex-col items-center justify-center gap-4">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-14 -right-14 w-52 h-52 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Column: Hijri status & Ramadan countdown */}
            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold text-[10px] font-bold uppercase tracking-widest">
                  <RiMoonClearLine size={13} />
                  <span>
                    {isRamadan
                      ? `Ramadan ${hijriYear}`
                      : `${hijriDate?.month?.en} ${hijriDate?.year} AH`}
                  </span>
                </span>

                {currentPrayer && (
                  <span className="inline-flex items-center gap-1 theme-badge text-[10px] font-bold uppercase tracking-wider bg-theme-soft theme-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Now: {currentPrayer}</span>
                  </span>
                )}
              </div>

              {isRamadan ? (
                <h3 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight">
                  Day {currentHijriDay} <span className="theme-muted font-normal text-lg">/ 30</span>
                </h3>
              ) : (
                <div className="space-y-0.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold theme-text tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <RiHourglassLine size={20} className="theme-gold" />
                    <span>~{daysUntilRamadan} Days Until Ramadan</span>
                  </h3>
                  <p className="text-xs theme-muted">
                    Sunnah & Voluntary Fasting Timings (Fajr to Maghrib)
                  </p>
                </div>
              )}
            </div>

            {/* Middle: Live Suhoor & Iftar Clocks */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme text-left">
                <RiSunLine size={20} className="theme-gold shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                    Suhoor (Fajr)
                  </span>
                  <span className="text-sm font-extrabold font-mono theme-text">{suhoorTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme text-left">
                <RiTimeLine size={20} className="theme-accent shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                    Iftar (Maghrib)
                  </span>
                  <span className="text-sm font-extrabold font-mono theme-text">{iftarTime}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Links */}
            <div className="flex flex-col items-center md:items-end gap-2.5 w-full md:w-auto">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold theme-gold">
                  <RiFireLine size={16} />
                  <span>{streak} Day Fasting Streak</span>
                </div>
              )}

              <button
                onClick={handleToggle}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFastedToday
                    ? "bg-accent text-[var(--accent-foreground)] shadow-sm"
                    : "theme-button-outline"
                }`}
              >
                <RiCheckLine size={16} />
                <span>{isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}</span>
              </button>

              <div className="flex items-center gap-3 mt-0.5">
                <Link
                  to="/prayer-times"
                  className="text-[11px] font-bold theme-secondary hover:theme-accent transition-colors flex items-center gap-1"
                >
                  <RiTimeLine size={13} />
                  <span>Prayer Times</span>
                </Link>

                <span className="theme-subtle text-[10px]">•</span>

                <Link
                  to="/fasting"
                  className="text-[11px] font-bold theme-muted hover:theme-accent transition-colors flex items-center gap-1"
                >
                  <span>Fasting Hub</span>
                  <RiArrowRightLine size={13} />
                </Link>
              </div>
            </div>
          </div>
      </div>
    </SectionWrapper>
  );
};

export default FastingHomeCard;