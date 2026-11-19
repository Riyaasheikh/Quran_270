import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiTimeLine,
  RiCalculatorLine,
  RiCompass3Line,
  RiMoonClearLine,
  RiArrowRightLine,
} from "@remixicon/react";
import SectionWrapper from "../../ui/SectionWrapper";

const PrayerQuickCard = () => {
  const [timings, setTimings] = useState(null);
  const [tomorrowTimings, setTomorrowTimings] = useState(null);
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const defaultLat = 31.5204;
    const defaultLon = 74.3587;

    const loadPrayerAndRamadan = async (lat, lon) => {
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

          if (hDate && Number(hDate.month?.number) !== 9) {
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
              const midnight = new Date();
              midnight.setHours(0, 0, 0, 0);
              const diff = Math.max(
                1,
                Math.round((ramadanStart - midnight) / (1000 * 60 * 60 * 24))
              );
              setDaysUntilRamadan(diff);
            }
          } else {
            setDaysUntilRamadan(0);
          }
        }

        if (tomorrowRes?.data) {
          setTomorrowTimings(tomorrowRes.data.timings);
        }
      } catch (err) {
        console.error("PrayerQuickCard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadPrayerAndRamadan(pos.coords.latitude, pos.coords.longitude),
        () => loadPrayerAndRamadan(defaultLat, defaultLon),
        { timeout: 8000 }
      );
    } else {
      loadPrayerAndRamadan(defaultLat, defaultLon);
    }
  }, []);

  if (loading || !timings) return null;

  const parseTime = (rawTime, addDays = 0) => {
    const [h, m] = rawTime.split(" ")[0].split(":").map(Number);
    const d = new Date(now);
    d.setDate(d.getDate() + addDays);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSec % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const schedule = [
    { name: "Fajr", time: parseTime(timings.Fajr), label: timings.Fajr.split(" ")[0] },
    { name: "Sunrise", time: parseTime(timings.Sunrise), label: timings.Sunrise.split(" ")[0] },
    { name: "Dhuhr", time: parseTime(timings.Dhuhr), label: timings.Dhuhr.split(" ")[0] },
    { name: "Asr", time: parseTime(timings.Asr), label: timings.Asr.split(" ")[0] },
    { name: "Maghrib", time: parseTime(timings.Maghrib), label: timings.Maghrib.split(" ")[0] },
    { name: "Isha", time: parseTime(timings.Isha), label: timings.Isha.split(" ")[0] },
  ];

  let currentPrayer = schedule[schedule.length - 1];
  let nextPrayer = {
    name: "Fajr",
    time: tomorrowTimings?.Fajr ? parseTime(tomorrowTimings.Fajr, 1) : parseTime(timings.Fajr, 1),
    label: tomorrowTimings?.Fajr?.split(" ")[0] || timings.Fajr.split(" ")[0],
  };

  for (let i = 0; i < schedule.length; i++) {
    if (now >= schedule[i].time) {
      currentPrayer = schedule[i];
      nextPrayer =
        i + 1 < schedule.length
          ? schedule[i + 1]
          : {
              name: "Fajr",
              time: tomorrowTimings?.Fajr
                ? parseTime(tomorrowTimings.Fajr, 1)
                : parseTime(timings.Fajr, 1),
              label: tomorrowTimings?.Fajr?.split(" ")[0] || timings.Fajr.split(" ")[0],
            };
    }
  }

  if (now < schedule[0].time) {
    currentPrayer = { name: "Isha", label: timings.Isha.split(" ")[0] };
    nextPrayer = schedule[0];
  }

  const nextCountdown = formatCountdown(nextPrayer.time - now);

  return (
    <SectionWrapper>
      <div className="theme-card w-full p-6 sm:p-8 rounded-3xl border border-theme shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Current & Next Prayer */}
          <div className="flex flex-wrap items-center gap-4" dir="ltr">
            <div className="px-4 py-3 rounded-2xl bg-theme-soft border border-theme min-w-[155px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                Current Prayer
              </span>
              <div className="flex items-baseline justify-between gap-3 mt-1">
                <span className="text-lg font-extrabold theme-accent">
                  {currentPrayer.name}
                </span>
                <span className="text-sm font-mono font-bold theme-text">
                  {currentPrayer.label}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-accent-soft/25 border border-accent/25 min-w-[185px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider theme-gold">
                Next: {nextPrayer.name} ({nextPrayer.label})
              </span>
              <span className="text-lg font-extrabold font-mono theme-text mt-1 block">
                -{nextCountdown}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/prayer-times"
              className="theme-button !px-4 !py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <RiTimeLine size={16} />
              <span>Prayer Times</span>
            </Link>

            <Link
              to="/zakat"
              className="theme-button-outline !px-4 !py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <RiCalculatorLine size={16} className="theme-gold" />
              <span>Zakat Calculator</span>
            </Link>

            <Link
              to="/fasting"
              className="theme-button-outline !px-4 !py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <RiMoonClearLine size={16} className="theme-accent" />
              <span>
                {daysUntilRamadan && daysUntilRamadan > 0
                  ? `Fasting Hub (Ramadan in ${daysUntilRamadan} days)`
                  : "Fasting Hub"}
              </span>
              <RiArrowRightLine size={14} className="rtl:rotate-180" />
            </Link>

            <Link
              to="/mosques"
              className="theme-button-outline !px-4 !py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <RiCompass3Line size={16} className="theme-gold" />
              <span>Qibla Direction</span>
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PrayerQuickCard;