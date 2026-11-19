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
  RiCalendarCheckLine,
} from "@remixicon/react";
import {
  getFastingRecords,
  toggleTodayFast,
  calculateFastingStreak,
  getVoluntaryFastingBadges,
} from "../../utils/fastingUtils";
import SectionWrapper from "../../ui/SectionWrapper";

const FastingHomeCard = () => {
  const [timings, setTimings] = useState(null);
  const [tomorrowTimings, setTomorrowTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [exactDaysUntilRamadan, setExactDaysUntilRamadan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(getFastingRecords());
  const [now, setNow] = useState(new Date());

  // Live 1-second ticker for accurate countdowns & prayer transitions
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const lat = 31.5204;
    const lon = 74.3587;

    const fetchAllData = async (latitude, longitude) => {
      try {
        const todayTimestamp = Math.floor(Date.now() / 1000);
        const tomorrowTimestamp = todayTimestamp + 86400;

        const [todayRes, tomorrowRes] = await Promise.all([
          fetch(
            `https://api.aladhan.com/v1/timings/${todayTimestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`
          ).then((r) => r.json()),
          fetch(
            `https://api.aladhan.com/v1/timings/${tomorrowTimestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`
          ).then((r) => r.json()),
        ]);

        if (todayRes?.data) {
          const hDate = todayRes.data.date.hijri;
          setTimings(todayRes.data.timings);
          setHijriDate(hDate);

          // Calculate exact days to 1 Ramadan using AlAdhan Hijri-to-Gregorian conversion
          if (hDate.month.number !== 9) {
            const targetYear =
              hDate.month.number > 9 ? Number(hDate.year) + 1 : Number(hDate.year);
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
                Math.round((ramadanStart - todayMidnight) / (1000 * 60 * 60 * 24))
              );
              setExactDaysUntilRamadan(diffDays);
            }
          }
        }

        if (tomorrowRes?.data) {
          setTomorrowTimings(tomorrowRes.data.timings);
        }
      } catch (err) {
        console.error("Fasting Home Card error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAllData(pos.coords.latitude, pos.coords.longitude),
        () => fetchAllData(lat, lon),
        { timeout: 8000 }
      );
    } else {
      fetchAllData(lat, lon);
    }
  }, []);

  if (loading || !timings) return null;

  const parsePrayerTime = (timeStr, addDays = 0) => {
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

  // Current prayer & fasting phase calculation
  const fajrToday = parsePrayerTime(timings.Fajr);
  const maghribToday = parsePrayerTime(timings.Maghrib);
  const isAfterMaghrib = now >= maghribToday;
  const isBeforeFajr = now < fajrToday;

  const prayerOrder = [
    { name: "Fajr", time: fajrToday },
    { name: "Sunrise", time: parsePrayerTime(timings.Sunrise) },
    { name: "Dhuhr", time: parsePrayerTime(timings.Dhuhr) },
    { name: "Asr", time: parsePrayerTime(timings.Asr) },
    { name: "Maghrib", time: maghribToday },
    { name: "Isha", time: parsePrayerTime(timings.Isha) },
  ];

  let currentPrayer = "Isha";
  for (let i = 0; i < prayerOrder.length; i++) {
    if (now >= prayerOrder[i].time) {
      currentPrayer = prayerOrder[i].name;
    }
  }

  // Show tomorrow's Suhoor once Maghrib has passed
  const activeSuhoorTime = isAfterMaghrib
    ? tomorrowTimings?.Fajr?.split(" ")[0] || timings.Fajr.split(" ")[0]
    : timings.Fajr.split(" ")[0];
  const activeIftarTime = timings.Maghrib.split(" ")[0];

  // Live phase status & countdown
  let phaseLabel = "Next Suhoor In";
  let countdownText = formatDuration(
    (isBeforeFajr
      ? fajrToday
      : parsePrayerTime(activeSuhoorTime, isAfterMaghrib ? 1 : 0)) - now
  );

  if (!isBeforeFajr && !isAfterMaghrib) {
    phaseLabel = "Iftar Countdown";
    countdownText = formatDuration(maghribToday - now);
  }

  const isRamadan = hijriDate?.month?.number === 9;
  const hijriYear = hijriDate?.year || "1448";
  const currentHijriDay = Number(hijriDate?.day || 1);

  const fallbackDays = Math.max(
    1,
    ((9 - (hijriDate?.month?.number || 1) + 12) % 12) * 30 - currentHijriDay
  );
  const daysUntilRamadan = exactDaysUntilRamadan ?? fallbackDays;

  const todayStr = now.toISOString().split("T")[0];
  const isFastedToday = records.some(
    (r) => r.date === todayStr && r.status === "completed"
  );
  const streak = calculateFastingStreak(records);
  const sunnahBadges = getVoluntaryFastingBadges(currentHijriDay);

  const handleToggle = () => {
    if (!isRamadan) return;
    const updated = toggleTodayFast(activeSuhoorTime, activeIftarTime);
    setRecords(updated);
  };

  return (
    <SectionWrapper>
      <div className="theme-card w-full p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-theme shadow-md">
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -top-14 -end-14 w-52 h-52 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Column: Hijri Status & Ramadan Countdown */}
          <div className="text-center lg:text-start space-y-1.5">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold text-[10px] font-bold uppercase tracking-widest">
                <RiMoonClearLine size={13} />
                <span>
                  {isRamadan
                    ? `Ramadan ${hijriYear} AH`
                    : `${hijriDate?.month?.en} ${hijriYear} AH`}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 theme-badge text-[10px] font-bold uppercase tracking-wider bg-theme-soft theme-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>Now: {currentPrayer}</span>
              </span>

              {!isRamadan && sunnahBadges.length > 0 && (
                <span className="inline-flex items-center gap-1 theme-badge theme-badge-accent text-[10px] font-bold uppercase tracking-wider">
                  <span>{sunnahBadges[0]}</span>
                </span>
              )}
            </div>

            {isRamadan ? (
              <h3 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight">
                Day {currentHijriDay}{" "}
                <span className="theme-muted font-normal text-lg">/ 30</span>
              </h3>
            ) : (
              <div>
                <h3
                  dir="ltr"
                  className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight inline-flex items-center justify-center lg:justify-start gap-2"
                >
                  <RiHourglassLine size={22} className="theme-gold shrink-0" />
                  <span>{daysUntilRamadan} Days Until Ramadan</span>
                </h3>
                <p className="text-xs theme-muted mt-0.5">
                  Daily fast check-in unlocks in Ramadan • Sunnah & Qadha timings active
                </p>
              </div>
            )}
          </div>

          {/* Middle: Live Suhoor, Iftar & Active Countdown */}
          <div
            dir="ltr"
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme text-left">
              <RiSunLine size={20} className="theme-gold shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                  {isAfterMaghrib ? "Tomorrow Suhoor" : "Suhoor (Fajr)"}
                </span>
                <span className="text-base font-extrabold font-mono theme-text">
                  {activeSuhoorTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme text-left">
              <RiTimeLine size={20} className="theme-accent shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                  Iftar (Maghrib)
                </span>
                <span className="text-base font-extrabold font-mono theme-text">
                  {activeIftarTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-accent-soft/30 border border-accent/25 text-left">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider theme-accent">
                  {phaseLabel}
                </span>
                <span className="text-base font-extrabold font-mono theme-text">
                  {countdownText}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Ramadan-Only Check-in & Links */}
          <div className="flex flex-col items-center lg:items-end gap-2.5 w-full lg:w-auto">
            {isRamadan && streak > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold theme-gold">
                <RiFireLine size={16} />
                <span>{streak} Day Ramadan Streak</span>
              </div>
            )}

            {isRamadan ? (
              <button
                onClick={handleToggle}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFastedToday
                    ? "bg-accent text-[var(--accent-foreground)] shadow-sm"
                    : "theme-button-outline"
                }`}
              >
                <RiCheckLine size={16} />
                <span>
                  {isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}
                </span>
              </button>
            ) : (
              <Link
                to="/fasting"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold theme-button-outline transition-all"
              >
                <RiCalendarCheckLine size={16} className="theme-gold" />
                <span>Log Qadha / Sunnah Fast</span>
              </Link>
            )}

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
                <RiArrowRightLine size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FastingHomeCard;