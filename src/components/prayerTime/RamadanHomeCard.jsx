import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiMoonClearLine,
  RiSunLine,
  RiTimeLine,
  RiFireLine,
  RiCheckLine,
  RiArrowRightLine,
  RiBookOpenLine,
} from "@remixicon/react";
import {
  getFastingRecords,
  toggleTodayFast,
  calculateFastingStreak,
  FAST_TYPES,
} from "../../utils/fastingUtils";
import SectionWrapper from "../../ui/SectionWrapper";

const DUAS_BY_CATEGORY = {
  sehri: {
    title: "Sehri Dua (Fasting Intention)",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    translation:
      "I intend to keep the fast for tomorrow in the month of Ramadan.",
  },
  iftari: {
    title: "Iftari Dua (Breaking Fast)",
    arabic:
      "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    translation:
      "O Allah, I fasted for You, I believe in You, I put my trust in You, and I break my fast with Your sustenance.",
  },
  duringRamadan: {
    title: "Dua During Ramadan",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    translation:
      "O Allah, You are Forgiving and Generous, and You love forgiveness, so forgive me.",
  },
};

const ASHRA_DUAS = [
  {
    id: "ashra-1",
    label: "Days 1–10 (Mercy)",
    title: "First 10 Days — Rahmah (Mercy)",
    arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ",
    translation:
      "My Lord, forgive and have mercy, and You are the Best of the merciful.",
  },
  {
    id: "ashra-2",
    label: "Days 11–20 (Forgiveness)",
    title: "Middle 10 Days — Maghfirah (Forgiveness)",
    arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ",
    translation:
      "I seek forgiveness from Allah, my Lord, for every sin, and I turn to Him in repentance.",
  },
  {
    id: "ashra-3",
    label: "Days 21–30 (Salvation)",
    title: "Last 10 Days — Najaat (Salvation from Fire)",
    arabic: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ",
    translation: "O Allah, save me from the Fire.",
  },
];

const RamadanHomeCard = () => {
  const [timings, setTimings] = useState(null);
  const [tomorrowTimings, setTomorrowTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(() => getFastingRecords());
  const [now, setNow] = useState(new Date());
  const [duaMode, setDuaMode] = useState("sehri"); // 'sehri' | 'iftari' | 'duringRamadan' | 'ashra'
  const [selectedAshraIdx, setSelectedAshraIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const defaultLat = 31.5204;
    const defaultLon = 74.3587;

    const loadRamadanData = async (lat, lon) => {
      try {
        const todayTs = Math.floor(Date.now() / 1000);
        const tomorrowTs = todayTs + 86400;

        const [todayRes, tomorrowRes] = await Promise.all([
          fetch(
            `https://api.aladhan.com/v1/timings/${todayTs}?latitude=${lat}&longitude=${lon}&method=1&school=1`
          ).then((r) => r.json()),
          fetch(
            `https://api.aladhan.com/v1/timings/${tomorrowTs}?latitude=${lat}&longitude=${lon}&method=1&school=1`
          ).then((r) => r.json()),
        ]);

        if (todayRes?.data) {
          setTimings(todayRes.data.timings);
          const hDate = todayRes.data.date?.hijri;
          setHijriDate(hDate);

          const dayNum = Number(hDate?.day || 1);
          setSelectedAshraIdx(dayNum <= 10 ? 0 : dayNum <= 20 ? 1 : 2);
        }

        if (tomorrowRes?.data) {
          setTomorrowTimings(tomorrowRes.data.timings);
        }
      } catch (err) {
        console.error("RamadanHomeCard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadRamadanData(pos.coords.latitude, pos.coords.longitude),
        () => loadRamadanData(defaultLat, defaultLon),
        { timeout: 8000 }
      );
    } else {
      loadRamadanData(defaultLat, defaultLon);
    }
  }, []);

  const isRamadan = Number(hijriDate?.month?.number) === 9;
  if (loading || !timings || !isRamadan) return null;

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

  const fajrToday = parsePrayerTime(timings.Fajr);
  const maghribToday = parsePrayerTime(timings.Maghrib);
  const isAfterMaghrib = now >= maghribToday;
  const isBeforeFajr = now < fajrToday;

  const activeSuhoorTime = isAfterMaghrib
    ? tomorrowTimings?.Fajr?.split(" ")[0] || timings.Fajr.split(" ")[0]
    : timings.Fajr.split(" ")[0];
  const activeIftarTime = timings.Maghrib.split(" ")[0];

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

  const currentHijriDay = Number(hijriDate?.day || 1);
  const hijriYear = hijriDate?.year || "1448";
  const todayStr = now.toISOString().split("T")[0];

  const isFastedToday = records.some(
    (r) => r.date === todayStr && r.status === "completed"
  );
  const ramadanLedger = records.filter(
    (r) => r.status === "completed" && r.type === FAST_TYPES.RAMADAN
  );
  const streak = calculateFastingStreak(records);

  const handleToggleFast = () => {
    if (!isRamadan) return;
    const updated = toggleTodayFast(
      activeSuhoorTime,
      activeIftarTime,
      FAST_TYPES.RAMADAN
    );
    setRecords(updated);
  };

  const activeDua =
    duaMode === "ashra" ? ASHRA_DUAS[selectedAshraIdx] : DUAS_BY_CATEGORY[duaMode];

  return (
    <SectionWrapper>
      <div className="theme-card w-full p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-theme shadow-md space-y-6">
        <div
          className="absolute -top-14 -end-14 w-52 h-52 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />

        {/* Header + Suhoor / Iftar + Fast Check-In */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-start space-y-1">
            <span className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold text-[10px] font-bold uppercase tracking-widest">
              <RiMoonClearLine size={13} />
              <span>Ramadan {hijriYear} AH</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight">
              Day {currentHijriDay}{" "}
              <span className="theme-muted font-normal text-lg">/ 30</span>
            </h3>
          </div>

          <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3">
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

          <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold theme-gold">
                <RiFireLine size={16} />
                <span>{streak} Day Streak</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleFast}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isFastedToday
                  ? "bg-accent text-[var(--accent-foreground)] shadow-sm"
                  : "theme-button-outline"
              }`}
            >
              <RiCheckLine size={16} />
              <span>{isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}</span>
            </button>
          </div>
        </div>

        {/* Ramadan Duas: Sehri, Iftari, During Ramadan, Each 10 Days */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-theme-soft/75 border border-theme space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider theme-gold flex items-center gap-1.5">
              <RiBookOpenLine size={15} />
              <span>Ramadan Duas</span>
            </span>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "sehri", label: "Sehri Dua" },
                { id: "iftari", label: "Iftari Dua" },
                { id: "duringRamadan", label: "During Ramadan" },
                { id: "ashra", label: "Each 10 Days (Ashra)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDuaMode(tab.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    duaMode === tab.id
                      ? "bg-accent text-[var(--accent-foreground)]"
                      : "bg-theme-card border border-theme theme-muted hover:theme-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {duaMode === "ashra" && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ASHRA_DUAS.map((a, idx) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAshraIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                    selectedAshraIdx === idx
                      ? "bg-accent-soft text-accent border border-accent/40"
                      : "bg-theme-card border border-theme theme-secondary"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          <div className="pt-1 space-y-1.5">
            <span className="text-xs font-bold theme-accent block">
              {activeDua.title}
            </span>
            <p
              dir="rtl"
              lang="ar"
              className="text-xl sm:text-2xl leading-loose text-right font-quran theme-text"
            >
              {activeDua.arabic}
            </p>
            <p className="text-xs sm:text-sm theme-secondary leading-relaxed">
              {activeDua.translation}
            </p>
          </div>
        </div>

        {/* Your Fast Ledger (Shown on Home Page Only During Ramadan) */}
        <div className="relative z-10 pt-3 border-t border-theme/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider theme-subtle">
              Your Fast Ledger:
            </span>
            <span className="font-bold theme-text">
              {ramadanLedger.length} / 30 Logged
            </span>
            {ramadanLedger.slice(0, 4).map((item) => (
              <span
                key={item.date}
                className="theme-badge theme-badge-gold text-[10px] py-0.5 px-2"
              >
                {item.date} ✓
              </span>
            ))}
          </div>

          <Link
            to="/fasting"
            className="text-xs font-bold theme-accent hover:underline inline-flex items-center gap-1"
          >
            <span>Open Fasting Hub</span>
            <RiArrowRightLine size={14} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default RamadanHomeCard;