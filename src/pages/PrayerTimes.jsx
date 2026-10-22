import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RiCompass3Line,
  RiTimeLine,
  RiMapPinLine,
  RiSettings4Line,
  RiSunLine,
  RiMoonLine,
  RiSparklingFill,
  RiFocus2Line,
  RiSearchLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiArrowRightUpLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import {
  calculateQiblaAngle,
  parseTimeToDate,
  formatTime12Hour,
  deriveExtraPrayerTimes,
  CALCULATION_METHODS,
} from "../utils/prayerTimeUtils";

const PrayerTimes = () => {
  // Navigation tabs: 'timings' | 'qibla'
  const [activeTab, setActiveTab] = useState("timings");

  // Location & Method States
  const [locationState, setLocationState] = useState({
    city: "Lahore",
    country: "Pakistan",
    latitude: 31.5204,
    longitude: 74.3587,
    isManual: false,
  });
  const [locationStatus, setLocationStatus] = useState("idle"); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [manualCityInput, setManualCityInput] = useState("");
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);

  // Settings
  const [calculationMethod, setCalculationMethod] = useState(() => {
    return Number(localStorage.getItem("deen360_prayer_method") || 1); // Default: Karachi
  });
  const [asrJuristic, setAsrJuristic] = useState(() => {
    return Number(localStorage.getItem("deen360_prayer_juristic") || 1); // 1 = Hanafi, 0 = Shafi'i
  });

  // Prayer Timings API Data
  const [timingsData, setTimingsData] = useState(null);
  const [apiDateInfo, setApiDateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Live Timer & Countdown
  const [currentTime, setCurrentTime] = useState(new Date());

  // Compass Heading
  const [compassHeading, setCompassHeading] = useState(0);
  const [hasCompassSupport, setHasCompassSupport] = useState(false);

  // 1. Live 1-Second Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Request Geolocation on Initial Mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationStatus("granted");

        // Reverse geocode to determine clean city name
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geoData = await geoRes.json();
          setLocationState({
            city: geoData.city || geoData.locality || "Current Location",
            country: geoData.countryName || "",
            latitude,
            longitude,
            isManual: false,
          });
        } catch {
          setLocationState((prev) => ({
            ...prev,
            latitude,
            longitude,
            city: "Current Location",
            isManual: false,
          }));
        }
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // 3. Fetch Prayer Times from AlAdhan API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError("");

    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${locationState.latitude}&longitude=${locationState.longitude}&method=${calculationMethod}&school=${asrJuristic}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch accurate astronomical timings.");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.code === 200 && data.data) {
          setTimingsData(data.data.timings);
          setApiDateInfo(data.data.date);
        } else {
          throw new Error("Invalid prayer timing payload.");
        }
      })
      .catch((err) => {
        if (isMounted) setFetchError(err.message || "Failed to load timings.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [locationState.latitude, locationState.longitude, calculationMethod, asrJuristic]);

  // 4. Manual City Lookup Fallback
  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!manualCityInput.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualCityInput.trim()
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const top = data[0];
        setLocationState({
          city: top.display_name.split(",")[0],
          country: top.display_name.split(",").slice(-1)[0]?.trim() || "",
          latitude: parseFloat(top.lat),
          longitude: parseFloat(top.lon),
          isManual: true,
        });
        setManualCityInput("");
      } else {
        alert("City not found. Please verify spelling.");
      }
    } catch {
      alert("Network fault searching city coordinates.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Device Orientation for Compass
  useEffect(() => {
    const handleOrientation = (e) => {
      let heading = e.alpha;
      // iOS webkit compass heading
      if (typeof e.webkitCompassHeading !== "undefined") {
        heading = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha !== null) {
        heading = 360 - e.alpha;
      }

      if (heading !== null && typeof heading !== "undefined") {
        setCompassHeading(heading);
        setHasCompassSupport(true);
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // 6. Compute Next Prayer, Active Window, & Live Countdown
  const scheduleAnalysis = useMemo(() => {
    if (!timingsData) return null;

    const prayerOrder = [
      { name: "Fajr", timeStr: timingsData.Fajr },
      { name: "Sunrise", timeStr: timingsData.Sunrise, isSolar: true },
      { name: "Dhuhr", timeStr: timingsData.Dhuhr },
      { name: "Asr", timeStr: timingsData.Asr },
      { name: "Maghrib", timeStr: timingsData.Maghrib },
      { name: "Isha", timeStr: timingsData.Isha },
    ];

    const parsedList = prayerOrder.map((p) => ({
      ...p,
      dateObj: parseTimeToDate(p.timeStr),
    }));

    const now = currentTime.getTime();

    // Determine current prayer and next prayer
    let nextIndex = parsedList.findIndex((p) => p.dateObj.getTime() > now);
    let activePrayer = null;

    if (nextIndex === -1) {
      // After Isha: next is tomorrow's Fajr
      const tomorrowFajr = new Date(parsedList[0].dateObj);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

      return {
        active: "Isha",
        next: "Fajr",
        nextDate: tomorrowFajr,
        diffMs: Math.max(0, tomorrowFajr.getTime() - now),
        parsedList,
      };
    }

    if (nextIndex === 0) {
      // Before Fajr: active is yesterday's Isha
      activePrayer = "Isha (Night)";
    } else {
      activePrayer = parsedList[nextIndex - 1].name;
    }

    const nextPrayer = parsedList[nextIndex];
    const diffMs = Math.max(0, nextPrayer.dateObj.getTime() - now);

    return {
      active: activePrayer,
      next: nextPrayer.name,
      nextDate: nextPrayer.dateObj,
      diffMs,
      parsedList,
    };
  }, [timingsData, currentTime]);

  // Derive Extra Astronomical Windows
  const extraTimes = useMemo(() => {
    if (!timingsData) return null;
    return deriveExtraPrayerTimes(timingsData.Sunrise, timingsData.Dhuhr);
  }, [timingsData]);

  // Qibla Direction Angle
  const qiblaAngle = useMemo(() => {
    return calculateQiblaAngle(locationState.latitude, locationState.longitude);
  }, [locationState.latitude, locationState.longitude]);

  // Format Countdown String
  const formatCountdown = (diffMs) => {
    if (!diffMs && diffMs !== 0) return "--:--:--";
    const totalSeconds = Math.floor(diffMs / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero & Tab Controls */}
        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay py-10 px-4 sm:px-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              Prayer Times & Qibla
            </h1>

            {/* Location Banner */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs sm:text-sm theme-muted font-medium">
              <RiMapPinLine size={16} className="theme-accent" />
              <span>
                {locationState.city}
                {locationState.country ? `, ${locationState.country}` : ""}
              </span>
              {locationState.isManual && (
                <span className="theme-badge text-[9px] py-0 px-1.5 bg-theme-soft">
                  Manual City
                </span>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-center gap-2 mt-7">
              <button
                onClick={() => setActiveTab("timings")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "timings"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiTimeLine size={15} />
                <span>Daily Prayer Timings</span>
              </button>

              <button
                onClick={() => setActiveTab("qibla")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "qibla"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiCompass3Line size={15} />
                <span>Qibla Direction</span>
              </button>
            </div>
          </div>
        </section>

        {/* Location Permission Denied Notification */}
        {locationStatus === "denied" && !locationState.isManual && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div
              className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--warning) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--warning) 30%, transparent)",
                color: "var(--warning)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <RiErrorWarningLine size={20} className="shrink-0" />
                <span>
                  Location access was not enabled. Showing timings for default city. Enter your city below for exact solar calculation.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Manual City Lookup Bar */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <form
            onSubmit={handleCitySearch}
            className="flex items-center gap-2 theme-card p-2 rounded-2xl shadow-sm border border-theme"
          >
            <RiSearchLine size={18} className="theme-subtle ml-2" />
            <input
              type="text"
              placeholder="Search any city worldwide (e.g. Islamabad, London, Makkah)..."
              value={manualCityInput}
              onChange={(e) => setManualCityInput(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs sm:text-sm theme-text w-full py-1.5"
            />
            <button type="submit" className="theme-button !py-2 !px-4 text-xs font-bold shrink-0">
              Update City
            </button>
          </form>
        </div>

        {/* =========================================================
            TAB 1: PRAYER TIMINGS + SOLAR NOON (ZAWAL) + ISHRAQ
           ========================================================= */}
        {activeTab === "timings" && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-300">
            {loading ? (
              <div className="theme-card p-16 flex flex-col items-center justify-center gap-3">
                <RiLoader4Line size={36} className="theme-accent animate-spin" />
                <p className="text-xs uppercase tracking-[0.25em] theme-subtle font-bold">
                  Calculating Celestial Angles...
                </p>
              </div>
            ) : fetchError ? (
              <div className="theme-card p-10 text-center border-dashed">
                <p className="text-sm font-bold text-[var(--danger)]">{fetchError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="theme-button mt-4 !py-2 text-xs"
                >
                  Retry Calculation
                </button>
              </div>
            ) : (
              <>
                {/* Countdown Card */}
                {scheduleAnalysis && (
                  <div className="theme-card p-6 sm:p-8 rounded-3xl mb-8 relative overflow-hidden border border-theme shadow-lg">
                    <div
                      className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none blur-3xl"
                      style={{ background: "var(--gradient-primary)" }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 theme-badge theme-badge-accent uppercase tracking-wider text-[10px] font-bold mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          <span>Current: {scheduleAnalysis.active}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold theme-text">
                          Next Prayer: <span className="theme-accent">{scheduleAnalysis.next}</span>
                        </h2>
                        <p className="text-xs theme-muted mt-1">
                          Adhan at {formatTime12Hour(scheduleAnalysis.nextDate)}
                        </p>
                      </div>

                      {/* Live Timer Countdown Box */}
                      <div className="self-stretch md:self-auto bg-theme-soft p-4 rounded-2xl border border-theme text-center min-w-[200px]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-subtle block mb-1">
                          Time Remaining
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono theme-text tracking-tight">
                          {formatCountdown(scheduleAnalysis.diffMs)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Daily Prayers Grid */}
                <h3 className="text-xs font-bold uppercase tracking-widest theme-subtle px-1 mb-4 flex items-center justify-between">
                  <span>Mandatory Daily Prayers (Fard)</span>
                  {apiDateInfo && (
                    <span className="theme-text normal-case font-semibold">
                      {apiDateInfo.hijri.day} {apiDateInfo.hijri.month.en} {apiDateInfo.hijri.year} AH
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                  {scheduleAnalysis?.parsedList.map((prayer) => {
                    const isNext = scheduleAnalysis.next === prayer.name;
                    const isActive = scheduleAnalysis.active === prayer.name;

                    return (
                      <div
                        key={prayer.name}
                        className={`theme-card p-4 rounded-2xl flex flex-col justify-between text-center transition-all ${
                          isNext
                            ? "!border-accent ring-2 ring-accent/20 bg-accent-soft/40 shadow-md transform -translate-y-1"
                            : isActive
                            ? "border-theme-strong bg-theme-soft"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isNext ? "theme-accent" : "theme-subtle"
                            }`}
                          >
                            {prayer.name}
                          </span>
                          {prayer.isSolar ? (
                            <RiSunLine size={14} className="theme-gold" />
                          ) : (
                            <RiMoonLine size={14} className="theme-muted" />
                          )}
                        </div>

                        <p className="text-lg sm:text-xl font-extrabold theme-text tracking-tight my-1 font-mono">
                          {formatTime12Hour(prayer.dateObj)}
                        </p>

                        <span
                          className={`text-[9px] font-bold uppercase mt-2 py-0.5 rounded-full ${
                            isNext
                              ? "bg-accent text-[var(--accent-foreground)]"
                              : isActive
                              ? "bg-theme-card theme-text border border-theme"
                              : "text-transparent"
                          }`}
                        >
                          {isNext ? "Upcoming" : isActive ? "Current" : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Islamic Timings: Ishraq, Chaasht, Zawal */}
                <h3 className="text-xs font-bold uppercase tracking-widest theme-subtle px-1 mb-4">
                  Astronomical & Voluntary (Nawafil) Windows
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                  {/* Ishraq */}
                  <div className="theme-card p-4 rounded-2xl flex items-start gap-3 border border-theme">
                    <div className="w-10 h-10 rounded-xl bg-theme-soft flex items-center justify-center theme-gold shrink-0">
                      <RiSunLine size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold theme-text">Ishraq</span>
                        <span className="text-[9px] theme-badge theme-badge-gold py-0 px-1.5">
                          Post-Sunrise
                        </span>
                      </div>
                      <p className="text-xs font-semibold theme-accent font-mono mt-1">
                        {extraTimes?.ishraq || "--:--"}
                      </p>
                      <p className="text-[10px] theme-muted mt-0.5">
                        Prayed ~15-20 min after sunrise when the sun has visibly risen.
                      </p>
                    </div>
                  </div>

                  {/* Chaasht (Duha) */}
                  <div className="theme-card p-4 rounded-2xl flex items-start gap-3 border border-theme">
                    <div className="w-10 h-10 rounded-xl bg-theme-soft flex items-center justify-center theme-accent shrink-0">
                      <RiSparklingFill size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold theme-text">Chaasht (Duha)</span>
                        <span className="text-[9px] theme-badge theme-badge-accent py-0 px-1.5">
                          Mid-Morning
                        </span>
                      </div>
                      <p className="text-xs font-semibold theme-accent font-mono mt-1">
                        {extraTimes?.chaasht || "--:--"}
                      </p>
                      <p className="text-[10px] theme-muted mt-0.5">
                        Voluntary forenoon prayer offering elevated spiritual rewards.
                      </p>
                    </div>
                  </div>

                  {/* Zawal (Tahreem) */}
                  <div className="theme-card p-4 rounded-2xl flex items-start gap-3 border border-theme">
                    <div className="w-10 h-10 rounded-xl bg-theme-soft flex items-center justify-center text-[var(--danger)] shrink-0">
                      <RiFocus2Line size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold theme-text">Zawal (Makruh Time)</span>
                        <span
                          className="text-[9px] font-bold uppercase px-1.5 py-0 rounded-full"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--danger) 15%, transparent)",
                            color: "var(--danger)",
                          }}
                        >
                          Forbidden
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--danger)] font-mono mt-1">
                        {extraTimes?.zawal || "--:--"}
                      </p>
                      <p className="text-[10px] theme-muted mt-0.5">
                        Sun reaches zenith. Prohibited to perform prostrations until Dhuhr.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calculation Methodology Bar */}
                <div className="theme-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-theme">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-subtle block">
                      Active Calculation Standard
                    </span>
                    <p className="text-xs sm:text-sm font-bold theme-text">
                      {CALCULATION_METHODS.find((m) => m.id === calculationMethod)?.name ||
                        "Standard"}
                    </p>
                    <p className="text-[11px] theme-muted mt-0.5">
                      Asr Juristic: {asrJuristic === 1 ? "Hanafi (Later)" : "Standard (Shafi'i, Maliki, Hanbali)"}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsMethodModalOpen(true)}
                    className="theme-button-outline !py-2 text-xs font-bold gap-1.5 cursor-pointer self-end sm:self-auto"
                  >
                    <RiSettings4Line size={16} />
                    <span>Adjust Method</span>
                  </button>
                </div>
              </>
            )}
          </main>
        )}

        {/* =========================================================
            TAB 2: QIBLA FINDER COMPASS
           ========================================================= */}
        {activeTab === "qibla" && (
          <main className="max-w-lg mx-auto px-4 py-12 animate-in fade-in duration-300">
            <div className="theme-card p-8 rounded-3xl text-center border border-theme shadow-2xl relative flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-gold mb-1">
                Direction to the Kaaba
              </span>
              <h2 className="text-2xl font-extrabold theme-text">Qibla Locator</h2>
              <p className="text-xs theme-muted mt-1 max-w-xs">
                Angle: <strong className="theme-text">{Math.round(qiblaAngle)}° from North</strong>
              </p>

              {/* The Compass Dial */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-8 rounded-full border-4 border-theme bg-theme-soft/50 shadow-inner flex items-center justify-center overflow-hidden">
                {/* North Marker */}
                <span className="absolute top-2 font-black text-xs theme-subtle">N</span>
                <span className="absolute bottom-2 font-black text-xs theme-subtle">S</span>
                <span className="absolute right-3 font-black text-xs theme-subtle">E</span>
                <span className="absolute left-3 font-black text-xs theme-subtle">W</span>

                {/* Rotating Needle / Arrow pointing to Kaaba */}
                <div
                  className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${qiblaAngle - (hasCompassSupport ? compassHeading : 0)}deg)`,
                  }}
                >
                  {/* Kaaba Direction Pin */}
                  <div className="flex flex-col items-center -translate-y-20">
                    <span className="text-2xl filter drop-shadow">🕋</span>
                    <span className="w-1.5 h-16 bg-gradient-to-t from-transparent to-accent rounded-full mt-1" />
                  </div>
                </div>

                {/* Center Pin */}
                <div className="w-4 h-4 rounded-full bg-accent border-2 border-[var(--bg-card)] shadow z-10" />
              </div>

              {/* Device Heading Notification */}
              {hasCompassSupport ? (
                <p className="text-xs font-semibold text-[var(--success)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-ping" />
                  Live Compass Active (Heading: {Math.round(compassHeading)}°)
                </p>
              ) : (
                <div className="p-3 rounded-xl bg-theme-soft border border-theme text-[11px] theme-muted leading-relaxed">
                  Rotate your phone toward <strong>{Math.round(qiblaAngle)}° clockwise</strong> relative to true North to face the Kaaba.
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {/* =========================================================
          CALCULATION METHOD ADJUSTMENT MODAL
         ========================================================= */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMethodModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md theme-card p-6 rounded-3xl border border-theme shadow-2xl">
            <h3 className="text-lg font-bold theme-text mb-1">Prayer Calculation Settings</h3>
            <p className="text-xs theme-muted mb-4">
              Select your preferred convention and juristic rulings for Fajr, Isha, and Asr.
            </p>

            <div className="space-y-4">
              {/* Method Dropdown */}
              <div>
                <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-2">
                  Calculation Convention
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-theme/30">
                  {CALCULATION_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setCalculationMethod(method.id);
                        localStorage.setItem("deen360_prayer_method", String(method.id));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        calculationMethod === method.id
                          ? "bg-accent-soft text-accent font-bold"
                          : "theme-text hover:bg-theme-soft"
                      }`}
                    >
                      <span>{method.name}</span>
                      {calculationMethod === method.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Juristic School (Asr Time) */}
              <div className="pt-2 border-t border-theme">
                <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-2">
                  Asr Juristic Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAsrJuristic(1);
                      localStorage.setItem("deen360_prayer_juristic", "1");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      asrJuristic === 1
                        ? "bg-accent text-[var(--accent-foreground)] border-accent"
                        : "border-theme theme-muted"
                    }`}
                  >
                    Hanafi (Shadow 2×)
                  </button>
                  <button
                    onClick={() => {
                      setAsrJuristic(0);
                      localStorage.setItem("deen360_prayer_juristic", "0");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      asrJuristic === 0
                        ? "bg-accent text-[var(--accent-foreground)] border-accent"
                        : "border-theme theme-muted"
                    }`}
                  >
                    Standard (Shadow 1×)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMethodModalOpen(false)}
              className="theme-button w-full !py-2.5 mt-6 text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PrayerTimes;