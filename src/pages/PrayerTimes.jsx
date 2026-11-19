
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

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
  RiArrowLeftLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";

import {
  getQiblaDirection,
  calculateQiblaAngle,
  parseTimeToDate,
  formatTime12Hour,
  CALCULATION_METHODS,
} from "../utils/prayerTimeUtils";
import { Link } from "react-router-dom";

const ALADHAN_API = "https://api.aladhan.com/v1";
const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const DEFAULT_METHOD = 1;
const DEFAULT_ASR_SCHOOL = 1;


// ============================================================
// SAFE LOCAL STORAGE
// ============================================================

const readStoredNumber = (key, fallback, allowedValues) => {
  try {
    const value = Number(window.localStorage.getItem(key));

    return allowedValues.includes(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
};


// ============================================================
// PARSE PRAYER TIME
// ============================================================

const parseClockParts = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Prayer time is missing.");
  }

  const cleaned = value
    .trim()
    .replace(/\s*\([^)]*\)/g, "")
    .trim();

  const match = cleaned.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
  );

  if (!match) {
    throw new Error(`Invalid prayer time: ${value}`);
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (minute > 59) {
    throw new Error(`Invalid prayer time: ${value}`);
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      throw new Error(`Invalid prayer time: ${value}`);
    }

    hour %= 12;

    if (meridiem === "PM") {
      hour += 12;
    }
  } else if (hour > 23) {
    throw new Error(`Invalid prayer time: ${value}`);
  }

  return { hour, minute };
};


// ============================================================
// TIMEZONE-AWARE PRAYER DATE
// ============================================================

/**
 * Converts a prayer time returned by AlAdhan into a Date.
 * Uses the prayer location's timezone, not necessarily
 * the computer's timezone.
 */

const prayerTimeToDate = (timeString, apiDate, timeZone) => {
  const { hour, minute } = parseClockParts(timeString);

  const dateString = apiDate?.gregorian?.date;

  const dateMatch =
    typeof dateString === "string"
      ? dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/)
      : null;

  if (!dateMatch || !timeZone) {
    return parseTimeToDate(timeString);
  }

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);

  const targetWallTime = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  let result = targetWallTime;

  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    // Correct the UTC estimate to match the location's
    // local clock time.
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const parts = formatter.formatToParts(
        new Date(result)
      );

      const values = Object.fromEntries(
        parts
          .filter((part) => part.type !== "literal")
          .map((part) => [
            part.type,
            Number(part.value),
          ])
      );

      const representedWallTime = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second
      );

      const difference =
        targetWallTime - representedWallTime;

      result += difference;

      if (difference === 0) break;
    }

    return new Date(result);
  } catch {
    return parseTimeToDate(timeString);
  }
};


// ============================================================
// FORMAT LOCATION TIME
// ============================================================

const formatInTimeZone = (date, timeZone) => {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    return "--:--";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return formatTime12Hour(date);
  }
};


// ============================================================
// TOMORROW'S DATE
// ============================================================

const getTomorrowApiDate = (dateString) => {
  const match =
    typeof dateString === "string"
      ? dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/)
      : null;

  if (!match) return null;

  const date = new Date(
    Date.UTC(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]) + 1
    )
  );

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");

  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};


// ============================================================
// COUNTDOWN FORMATTER
// ============================================================

const formatCountdown = (milliseconds) => {
  if (
    !Number.isFinite(milliseconds) ||
    milliseconds < 0
  ) {
    return "--:--:--";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = String(
    Math.floor(totalSeconds / 3600)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor((totalSeconds % 3600) / 60)
  ).padStart(2, "0");

  const seconds = String(
    totalSeconds % 60
  ).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};


// ============================================================
// ADDITIONAL PRAYER WINDOWS
// ============================================================

const deriveLocationExtraTimes = (
  timings,
  dateInfo,
  timeZone
) => {
  if (
    !timings?.Sunrise ||
    !timings?.Dhuhr ||
    !dateInfo
  ) {
    return null;
  }

  try {
    const sunrise = prayerTimeToDate(
      timings.Sunrise,
      dateInfo,
      timeZone
    );

    let dhuhr = prayerTimeToDate(
      timings.Dhuhr,
      dateInfo,
      timeZone
    );

    if (dhuhr.getTime() <= sunrise.getTime()) {
      dhuhr = new Date(
        dhuhr.getTime() + 24 * 60 * 60 * 1000
      );
    }

    const addMinutes = (date, minutes) =>
      new Date(
        date.getTime() + minutes * 60 * 1000
      );

    const ishraqStart = addMinutes(sunrise, 18);
    const ishraqEnd = addMinutes(sunrise, 45);

    const chaashtStart = addMinutes(sunrise, 50);

    const zawalStart = addMinutes(dhuhr, -10);
    const zawalEnd = dhuhr;

    const chaashtEnd = addMinutes(zawalStart, -5);

    if (chaashtEnd <= chaashtStart) {
      return null;
    }

    return {
      ishraq:
        `${formatInTimeZone(ishraqStart, timeZone)} - ` +
        `${formatInTimeZone(ishraqEnd, timeZone)}`,

      chaasht:
        `${formatInTimeZone(chaashtStart, timeZone)} - ` +
        `${formatInTimeZone(chaashtEnd, timeZone)}`,

      zawal:
        `${formatInTimeZone(zawalStart, timeZone)} - ` +
        `${formatInTimeZone(zawalEnd, timeZone)}`,
    };
  } catch (error) {
    console.error(
      "Unable to derive additional prayer windows:",
      error
    );

    return null;
  }
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const PrayerTimes = () => {
  const [activeTab, setActiveTab] = useState("timings");

  // No hardcoded city or coordinates.
  const [locationState, setLocationState] = useState(null);

  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationError, setLocationError] = useState("");

  const [manualCityInput, setManualCityInput] = useState("");
  const [citySearchLoading, setCitySearchLoading] = useState(false);

  const [calculationMethod, setCalculationMethod] = useState(() =>
    readStoredNumber(
      "deen360_prayer_method",
      DEFAULT_METHOD,
      CALCULATION_METHODS.map((method) => method.id)
    )
  );

  const [asrJuristic, setAsrJuristic] = useState(() =>
    readStoredNumber(
      "deen360_prayer_juristic",
      DEFAULT_ASR_SCHOOL,
      [0, 1]
    )
  );

  const [isMethodModalOpen, setIsMethodModalOpen] =
    useState(false);

  // Prayer API data
  const [timingsData, setTimingsData] = useState(null);
  const [apiDateInfo, setApiDateInfo] = useState(null);
  const [apiMeta, setApiMeta] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Live clock
  const [currentTime, setCurrentTime] = useState(
    () => new Date()
  );

  // Compass
  const [compassHeading, setCompassHeading] = useState(null);
  const [compassPermission, setCompassPermission] =
    useState("idle");

  const [compassError, setCompassError] = useState("");


  // ==========================================================
  // LIVE CLOCK
  // ==========================================================

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);


  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "deen360_prayer_method",
        String(calculationMethod)
      );
    } catch {
      // Storage is optional.
    }
  }, [calculationMethod]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "deen360_prayer_juristic",
        String(asrJuristic)
      );
    } catch {
      // Storage is optional.
    }
  }, [asrJuristic]);


  // ==========================================================
  // GET CURRENT GPS LOCATION
  // ==========================================================

  const handleUseMyLocation = useCallback(async () => {
    setLocationStatus("requesting");
    setLocationError("");

    try {
      const result = await getQiblaDirection({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });

      let city = "Current location";
      let country = "";

      // Reverse geocode GPS coordinates into a city name.
      try {
        const reverseUrl = new URL(
          "https://api.bigdatacloud.net/data/reverse-geocode-client"
        );

        reverseUrl.searchParams.set(
          "latitude",
          result.latitude
        );

        reverseUrl.searchParams.set(
          "longitude",
          result.longitude
        );

        reverseUrl.searchParams.set(
          "localityLanguage",
          "en"
        );

        const response = await fetch(reverseUrl.toString());

        if (response.ok) {
          const geo = await response.json();

          city =
            geo.city ||
            geo.locality ||
            geo.principalSubdivision ||
            city;

          country = geo.countryName || "";
        }
      } catch {
        // GPS coordinates still work if reverse geocoding fails.
      }

      setLocationState({
        city,
        country,
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        isManual: false,
      });

      setLocationStatus("granted");
      setCompassHeading(null);

    } catch (error) {
      setLocationStatus("denied");

      setLocationError(
        error?.message ||
          "Unable to access your location. Search for your city instead."
      );
    }
  }, []);


  // ==========================================================
  // SEARCH CITY MANUALLY
  // ==========================================================

  const handleCitySearch = useCallback(
    async (event) => {
      event.preventDefault();

      const query = manualCityInput.trim();

      if (!query) {
        setLocationError("Enter a city name first.");
        return;
      }

      setCitySearchLoading(true);
      setLocationError("");

      try {
        const url = new URL(GEOCODING_API);

        url.searchParams.set("name", query);
        url.searchParams.set("count", "5");
        url.searchParams.set("language", "en");
        url.searchParams.set("format", "json");

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(
            "City search is temporarily unavailable."
          );
        }

        const result = await response.json();
        const city = result.results?.[0];

        if (!city) {
          throw new Error(
            "City not found. Check the spelling or try a nearby larger city."
          );
        }

        setLocationState({
          city: city.name,
          country: city.country || "",
          latitude: Number(city.latitude),
          longitude: Number(city.longitude),
          accuracy: null,
          isManual: true,
        });

        setLocationStatus("manual");
        setManualCityInput("");
        setCompassHeading(null);

      } catch (error) {
        setLocationError(
          error?.message ||
            "Unable to search for this city."
        );
      } finally {
        setCitySearchLoading(false);
      }
    },
    [manualCityInput]
  );


  // ==========================================================
  // FETCH PRAYER TIMES
  // ==========================================================

  useEffect(() => {
    if (!locationState) {
      setTimingsData(null);
      setApiDateInfo(null);
      setApiMeta(null);
      setLoading(false);

      return undefined;
    }

    const controller = new AbortController();

    const fetchPrayerTimes = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const timestamp = Math.floor(
          Date.now() / 1000
        );

        const url = new URL(
          `${ALADHAN_API}/timings/${timestamp}`
        );

        url.searchParams.set(
          "latitude",
          String(locationState.latitude)
        );

        url.searchParams.set(
          "longitude",
          String(locationState.longitude)
        );

        url.searchParams.set(
          "method",
          String(calculationMethod)
        );

        url.searchParams.set(
          "school",
          String(asrJuristic)
        );

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            "Prayer-time service could not be reached. Please try again."
          );
        }

        const payload = await response.json();

        if (
          payload.code !== 200 ||
          !payload.data?.timings
        ) {
          throw new Error(
            payload.status ||
              "The prayer-time service returned invalid data."
          );
        }

        const requiredTimes = [
          "Fajr",
          "Sunrise",
          "Dhuhr",
          "Asr",
          "Maghrib",
          "Isha",
        ];

        const missingTime = requiredTimes.find(
          (name) => !payload.data.timings[name]
        );

        if (missingTime) {
          throw new Error(
            `The service did not return ${missingTime} time.`
          );
        }

        setTimingsData(payload.data.timings);
        setApiDateInfo(payload.data.date || null);
        setApiMeta(payload.data.meta || null);

      } catch (error) {
        if (error.name !== "AbortError") {
          setFetchError(
            error?.message ||
              "Unable to load prayer times."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPrayerTimes();

    return () => controller.abort();

  }, [
    locationState,
    calculationMethod,
    asrJuristic,
    retryCount,
  ]);


  // ==========================================================
  // DEVICE COMPASS
  // ==========================================================

  const handleOrientationEvent = useCallback((event) => {
    let heading = null;

    // iOS Safari compass heading.
    if (Number.isFinite(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    }

    // Absolute orientation fallback.
    else if (
      event.absolute === true &&
      Number.isFinite(event.alpha)
    ) {
      heading = (360 - event.alpha + 360) % 360;
    }

    if (Number.isFinite(heading)) {
      setCompassHeading(
        (heading + 360) % 360
      );

      setCompassPermission("granted");
      setCompassError("");
    }
  }, []);

  useEffect(() => {
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientationEvent,
      true
    );

    window.addEventListener(
      "deviceorientation",
      handleOrientationEvent,
      true
    );

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientationEvent,
        true
      );

      window.removeEventListener(
        "deviceorientation",
        handleOrientationEvent,
        true
      );
    };
  }, [handleOrientationEvent]);


  // Compass sensor timeout.
  useEffect(() => {
    if (
      compassPermission !== "requesting" ||
      compassHeading !== null
    ) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCompassPermission((current) =>
        current === "requesting"
          ? "unsupported"
          : current
      );
    }, 7000);

    return () => window.clearTimeout(timeout);

  }, [compassPermission, compassHeading]);


  // Request compass permission from a user click.
  const enableCompass = useCallback(async () => {
    setCompassError("");
    setCompassHeading(null);

    try {
      if (
        typeof window.DeviceOrientationEvent !== "undefined" &&
        typeof window.DeviceOrientationEvent.requestPermission ===
          "function"
      ) {
        const permission =
          await window.DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          setCompassPermission("denied");

          setCompassError(
            "Motion permission was not granted. You can still use the numeric Qibla bearing."
          );

          return;
        }
      }

      if (!("DeviceOrientationEvent" in window)) {
        setCompassPermission("unsupported");

        setCompassError(
          "This browser does not provide a device-orientation sensor."
        );

        return;
      }

      setCompassPermission("requesting");

    } catch (error) {
      setCompassPermission("denied");

      setCompassError(
        error?.message ||
          "The device compass permission could not be enabled."
      );
    }
  }, []);


  // ==========================================================
  // QIBLA BEARING
  // ==========================================================

  const qiblaAngle = useMemo(() => {
    if (!locationState) return null;

    try {
      return calculateQiblaAngle(
        locationState.latitude,
        locationState.longitude
      );
    } catch {
      return null;
    }
  }, [locationState]);


  // ==========================================================
  // PRAYER SCHEDULE ANALYSIS
  // ==========================================================

  const scheduleAnalysis = useMemo(() => {
    if (!timingsData || !apiDateInfo) {
      return null;
    }

    try {
      const timezone = apiMeta?.timezone;

      // Sunrise is deliberately excluded from the Fard prayer list.
      const prayerNames = [
        "Fajr",
        "Dhuhr",
        "Asr",
        "Maghrib",
        "Isha",
      ];

      const fardPrayers = prayerNames.map((name) => ({
        name,
        timeStr: timingsData[name],

        dateObj: prayerTimeToDate(
          timingsData[name],
          apiDateInfo,
          timezone
        ),
      }));

      const displayList = [
        {
          name: "Fajr",
          timeStr: timingsData.Fajr,
          isSolar: false,
          dateObj: fardPrayers[0].dateObj,
        },
        {
          name: "Sunrise",
          timeStr: timingsData.Sunrise,
          isSolar: true,

          dateObj: prayerTimeToDate(
            timingsData.Sunrise,
            apiDateInfo,
            timezone
          ),
        },
        {
          name: "Dhuhr",
          timeStr: timingsData.Dhuhr,
          isSolar: false,
          dateObj: fardPrayers[1].dateObj,
        },
        {
          name: "Asr",
          timeStr: timingsData.Asr,
          isSolar: false,
          dateObj: fardPrayers[2].dateObj,
        },
        {
          name: "Maghrib",
          timeStr: timingsData.Maghrib,
          isSolar: false,
          dateObj: fardPrayers[3].dateObj,
        },
        {
          name: "Isha",
          timeStr: timingsData.Isha,
          isSolar: false,
          dateObj: fardPrayers[4].dateObj,
        },
      ];

      const now = currentTime.getTime();

      const nextIndex = fardPrayers.findIndex(
        (prayer) => prayer.dateObj.getTime() > now
      );

      let nextPrayer;
      let nextDate;
      let activePrayer;

      if (nextIndex === -1) {
        // After Isha, next prayer is tomorrow's Fajr.
        const tomorrow = getTomorrowApiDate(
          apiDateInfo.gregorian?.date
        );

        nextPrayer = "Fajr";

        nextDate = tomorrow
          ? prayerTimeToDate(
              timingsData.Fajr,
              {
                gregorian: {
                  date: tomorrow,
                },
              },
              timezone
            )
          : new Date(
              fardPrayers[0].dateObj.getTime() +
                24 * 60 * 60 * 1000
            );

        activePrayer = "Isha";

      } else {
        nextPrayer = fardPrayers[nextIndex].name;
        nextDate = fardPrayers[nextIndex].dateObj;

        activePrayer =
          nextIndex === 0
            ? "Isha (Night)"
            : fardPrayers[nextIndex - 1].name;
      }

      return {
        active: activePrayer,
        next: nextPrayer,
        nextDate,

        diffMs: Math.max(
          0,
          nextDate.getTime() - now
        ),

        parsedList: displayList,
        timezone,
      };

    } catch (error) {
      console.error(
        "Unable to process prayer schedule:",
        error
      );

      return null;
    }
  }, [
    timingsData,
    apiDateInfo,
    apiMeta,
    currentTime,
  ]);


  // ==========================================================
  // EXTRA PRAYER WINDOWS
  // ==========================================================

  const extraTimes = useMemo(() => {
    if (!timingsData || !apiDateInfo) {
      return null;
    }

    return deriveLocationExtraTimes(
      timingsData,
      apiDateInfo,
      apiMeta?.timezone
    );

  }, [
    timingsData,
    apiDateInfo,
    apiMeta,
  ]);


  const selectedMethodName =
    CALCULATION_METHODS.find(
      (method) => method.id === calculationMethod
    )?.name || "Selected calculation method";


  const closeMethodModal = () => {
    setIsMethodModalOpen(false);
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">

      <div>

        <Navbar />


        {/* ====================================================
            HERO SECTION
        ==================================================== */}

        <section className="relative overflow-hidden border-b border-theme bg-theme-overlay px-3 py-8 sm:px-6 sm:py-10">
<div className="mb-6">
          <Link
            to="/"
            className="theme-button-outline !min-h-[2.35rem] !px-4 !rounded-full text-xs inline-flex items-center gap-2"
          >
            <RiArrowLeftLine size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
            style={{
              background: "var(--gradient-gold)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] theme-gold">
              Deen 360 • Daily worship
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight theme-text sm:text-4xl md:text-5xl">
              Prayer Times &amp; Qibla
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium theme-muted sm:text-sm">

              <RiMapPinLine
                size={16}
                className="theme-accent"
              />

              <span>
                {locationState
                  ? `${locationState.city}${
                      locationState.country
                        ? `, ${locationState.country}`
                        : ""
                    }`
                  : "Choose your location to begin"}
              </span>

              {locationState?.isManual && (
                <span className="theme-badge bg-theme-soft px-1.5 py-0 text-[9px]">
                  Selected city
                </span>
              )}

              {locationState && !locationState.isManual && (
                <span className="theme-badge bg-theme-soft px-1.5 py-0 text-[9px]">
                  GPS location
                </span>
              )}

            </div>


            {/* Navigation tabs */}

            <div className="mx-auto mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => setActiveTab("timings")}
                aria-pressed={activeTab === "timings"}
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                  activeTab === "timings"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiTimeLine size={15} />
                Daily Prayer Timings
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("qibla")}
                aria-pressed={activeTab === "qibla"}
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                  activeTab === "qibla"
                    ? "bg-accent text-[var(--accent-foreground)] shadow-md"
                    : "theme-button-outline"
                }`}
              >
                <RiCompass3Line size={15} />
                Qibla Direction
              </button>

            </div>
          </div>
        </section>


        {/* ====================================================
            LOCATION CONTROLS
        ==================================================== */}

        <section className="mx-auto mt-5 w-full max-w-5xl px-3 sm:px-6">

          <div className="theme-card flex flex-col gap-3 rounded-2xl border border-theme p-3 sm:p-4">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">
                <p className="text-xs font-bold theme-text">
                  Set your location
                </p>

                <p className="mt-0.5 text-[11px] theme-muted">
                  Prayer times and Qibla are calculated from these coordinates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationStatus === "requesting"}
                className="theme-button flex min-h-10 w-full shrink-0 items-center justify-center gap-2 !px-4 !py-2 text-xs font-bold sm:w-auto"
              >
                {locationStatus === "requesting" ? (
                  <RiLoader4Line
                    className="animate-spin"
                    size={16}
                  />
                ) : (
                  <RiMapPinLine size={16} />
                )}

                {locationStatus === "requesting"
                  ? "Getting location..."
                  : "Use my location"}
              </button>

            </div>


            {/* Manual city search */}

            <form
              onSubmit={handleCitySearch}
              className="flex min-w-0 flex-col gap-2 sm:flex-row"
            >

              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-theme bg-theme-soft px-3">

                <RiSearchLine
                  size={17}
                  className="shrink-0 theme-subtle"
                />

                <input
                  type="search"
                  value={manualCityInput}
                  onChange={(event) =>
                    setManualCityInput(event.target.value)
                  }
                  placeholder="Search a city (e.g. Islamabad, London, Makkah)"
                  aria-label="Search city"
                  className="min-w-0 w-full bg-transparent py-3 text-sm theme-text outline-none placeholder:theme-subtle"
                />

              </div>

              <button
                type="submit"
                disabled={
                  citySearchLoading ||
                  !manualCityInput.trim()
                }
                className="theme-button-outline min-h-11 w-full shrink-0 !px-5 !py-2 text-xs font-bold sm:w-auto"
              >
                {citySearchLoading
                  ? "Searching..."
                  : "Search city"}
              </button>

            </form>


            {/* Location errors */}

            {(locationError ||
              locationStatus === "denied") && (

              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border p-3 text-xs"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--warning) 35%, transparent)",

                  color: "var(--warning)",

                  backgroundColor:
                    "color-mix(in srgb, var(--warning) 8%, transparent)",
                }}
              >

                <RiErrorWarningLine
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {locationError ||
                    "Location permission was not granted. Search for your city instead."}
                </span>

              </div>
            )}


            {/* Coordinates */}

            {locationState && (
              <p className="break-words text-[10px] theme-subtle">

                Coordinates:{" "}
                {locationState.latitude.toFixed(5)},{" "}
                {locationState.longitude.toFixed(5)}

                {Number.isFinite(locationState.accuracy) &&
                  ` • GPS accuracy approximately ±${Math.round(
                    locationState.accuracy
                  )} m`}

              </p>
            )}

          </div>
        </section>


        {/* ====================================================
            TAB 1 — PRAYER TIMES
        ==================================================== */}

        {activeTab === "timings" && (

          <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">

            {!locationState ? (

              <div className="theme-card flex flex-col items-center rounded-3xl border border-theme p-8 text-center sm:p-12">

                <RiMapPinLine
                  size={34}
                  className="mb-3 theme-accent"
                />

                <h2 className="text-lg font-bold theme-text">
                  Select your location
                </h2>

                <p className="mt-2 max-w-md text-xs leading-relaxed theme-muted">
                  Allow location access or search for your city to see its
                  prayer times. Deen 360 will not assume a default city.
                </p>

              </div>

            ) : loading ? (

              <div className="theme-card flex flex-col items-center justify-center gap-3 rounded-3xl p-14">

                <RiLoader4Line
                  size={36}
                  className="animate-spin theme-accent"
                />

                <p className="text-xs font-bold uppercase tracking-[0.2em] theme-subtle">
                  Loading prayer times...
                </p>

              </div>

            ) : fetchError ? (

              <div className="theme-card rounded-3xl border border-theme p-8 text-center">

                <RiErrorWarningLine
                  size={30}
                  className="mx-auto mb-3 text-[var(--danger)]"
                />

                <p className="text-sm font-bold text-[var(--danger)]">
                  {fetchError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setRetryCount((count) => count + 1)
                  }
                  className="theme-button mt-4 !py-2 text-xs"
                >
                  Try again
                </button>

              </div>

            ) : !timingsData || !scheduleAnalysis ? (

              <div className="theme-card rounded-3xl p-8 text-center">

                <p className="text-sm theme-muted">
                  Prayer times are not available for this location right now.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setRetryCount((count) => count + 1)
                  }
                  className="theme-button mt-4 !py-2 text-xs"
                >
                  Reload timings
                </button>

              </div>

            ) : (

              <>

                {/* NEXT PRAYER COUNTDOWN */}

                <section className="theme-card relative mb-8 overflow-hidden rounded-3xl border border-theme p-5 shadow-lg sm:p-8">

                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl"
                    style={{
                      background: "var(--gradient-primary)",
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">

                    <div className="min-w-0">

                      <div className="theme-badge theme-badge-accent mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">

                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />

                        Current: {scheduleAnalysis.active}

                      </div>

                      <h2 className="text-2xl font-extrabold theme-text sm:text-3xl">

                        Next Prayer:{" "}

                        <span className="theme-accent">
                          {scheduleAnalysis.next}
                        </span>

                      </h2>

                      <p className="mt-1 text-xs theme-muted">
                        Adhan at{" "}

                        {formatInTimeZone(
                          scheduleAnalysis.nextDate,
                          scheduleAnalysis.timezone
                        )}

                      </p>

                    </div>


                    {/* Countdown */}

                    <div className="w-full rounded-2xl border border-theme bg-theme-soft p-4 text-center md:w-auto md:min-w-[210px]">

                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] theme-subtle">
                        Time remaining
                      </span>

                      <span className="block break-all font-mono text-3xl font-black tracking-tight theme-text sm:text-4xl">

                        {formatCountdown(
                          scheduleAnalysis.diffMs
                        )}

                      </span>

                    </div>

                  </div>
                </section>


                {/* DAILY PRAYER CARDS */}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">

                  <h3 className="text-xs font-bold uppercase tracking-widest theme-subtle">
                    Daily Prayer Timings
                  </h3>

                  {apiDateInfo?.hijri && (

                    <span className="text-xs font-semibold theme-text">

                      {apiDateInfo.hijri.day}{" "}

                      {apiDateInfo.hijri.month?.en}{" "}

                      {apiDateInfo.hijri.year} AH

                    </span>
                  )}

                </div>


                <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">

                  {scheduleAnalysis.parsedList.map((prayer) => {

                    const isNext =
                      !prayer.isSolar &&
                      scheduleAnalysis.next === prayer.name;

                    const isActive =
                      !prayer.isSolar &&
                      scheduleAnalysis.active === prayer.name;

                    return (

                      <article
                        key={prayer.name}
                        className={`theme-card flex min-w-0 flex-col justify-between rounded-2xl border border-theme p-3 text-center transition-all sm:p-4 ${
                          isNext
                            ? "!border-accent bg-accent-soft/40 shadow-md"
                            : isActive
                              ? "bg-theme-soft"
                              : ""
                        }`}
                      >

                        <div className="mb-2 flex items-center justify-between gap-1">

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isNext
                                ? "theme-accent"
                                : "theme-subtle"
                            }`}
                          >
                            {prayer.name}
                          </span>

                          {prayer.isSolar ? (

                            <RiSunLine
                              size={14}
                              className="shrink-0 theme-gold"
                            />

                          ) : (

                            <RiMoonLine
                              size={14}
                              className="shrink-0 theme-muted"
                            />

                          )}

                        </div>


                        <p className="my-1 break-words font-mono text-base font-extrabold tracking-tight theme-text sm:text-xl">

                          {formatInTimeZone(
                            prayer.dateObj,
                            scheduleAnalysis.timezone
                          )}

                        </p>


                        <span
                          className={`mt-2 rounded-full py-0.5 text-[9px] font-bold uppercase ${
                            isNext
                              ? "bg-accent text-[var(--accent-foreground)]"
                              : isActive
                                ? "border border-theme bg-theme-card theme-text"
                                : "text-transparent"
                          }`}
                        >
                          {isNext
                            ? "Upcoming"
                            : isActive
                              ? "Current"
                              : "—"}
                        </span>

                      </article>

                    );
                  })}

                </div>


                {/* ADDITIONAL PRAYER WINDOWS */}

                <h3 className="mb-4 px-1 text-xs font-bold uppercase tracking-widest theme-subtle">
                  Additional Prayer Windows
                </h3>


                <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">


                  {/* ISHRAQ */}

                  <article className="theme-card flex items-start gap-3 rounded-2xl border border-theme p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-soft theme-gold">
                      <RiSunLine size={20} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs font-bold theme-text">
                        Ishraq
                      </p>

                      <p className="mt-1 break-words font-mono text-xs font-semibold theme-accent">
                        {extraTimes?.ishraq || "Not available"}
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed theme-muted">
                        Approximate window after sunrise. Confirm the local
                        time with your mosque or trusted authority.
                      </p>

                    </div>
                  </article>


                  {/* CHAASHT */}

                  <article className="theme-card flex items-start gap-3 rounded-2xl border border-theme p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-soft theme-accent">
                      <RiSparklingFill size={20} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs font-bold theme-text">
                        Chaasht (Duha)
                      </p>

                      <p className="mt-1 break-words font-mono text-xs font-semibold theme-accent">
                        {extraTimes?.chaasht || "Not available"}
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed theme-muted">
                        Approximate mid-morning voluntary prayer window.
                      </p>

                    </div>
                  </article>


                  {/* ZAWAL */}

                  <article className="theme-card flex items-start gap-3 rounded-2xl border border-theme p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-soft text-[var(--danger)]">
                      <RiFocus2Line size={20} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs font-bold theme-text">
                        Zawal estimate
                      </p>

                      <p className="mt-1 break-words font-mono text-xs font-semibold text-[var(--danger)]">
                        {extraTimes?.zawal || "Not available"}
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed theme-muted">
                        Approximate precautionary interval before Dhuhr;
                        local rulings and timetables may differ.
                      </p>

                    </div>
                  </article>

                </div>


                {/* CALCULATION SETTINGS */}

                <section className="theme-card flex flex-col items-start justify-between gap-4 rounded-2xl border border-theme p-5 sm:flex-row sm:items-center">

                  <div className="min-w-0">

                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                      Calculation settings
                    </span>

                    <p className="text-xs font-bold theme-text sm:text-sm">
                      {selectedMethodName}
                    </p>

                    <p className="mt-0.5 text-[11px] theme-muted">
                      Asr:{" "}

                      {asrJuristic === 1
                        ? "Hanafi (shadow factor 2)"
                        : "Standard (shadow factor 1)"}
                    </p>

                    {apiMeta?.timezone && (

                      <p className="mt-0.5 text-[10px] theme-subtle">
                        Location timezone: {apiMeta.timezone}
                      </p>

                    )}

                  </div>


                  <button
                    type="button"
                    onClick={() => setIsMethodModalOpen(true)}
                    className="theme-button-outline flex min-h-10 w-full items-center justify-center gap-2 !px-4 !py-2 text-xs font-bold sm:w-auto"
                  >
                    <RiSettings4Line size={16} />
                    Adjust method
                  </button>

                </section>

              </>

            )}

          </main>
        )}


        {/* ====================================================
            TAB 2 — QIBLA FINDER
        ==================================================== */}

        {activeTab === "qibla" && (

          <main className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-6 sm:py-10">

            <section className="theme-card flex min-w-0 flex-col items-center overflow-hidden rounded-3xl border border-theme p-4 text-center shadow-xl sm:p-8">

              <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] theme-gold">
                Direction to the Kaaba
              </span>

              <h2 className="text-2xl font-extrabold theme-text sm:text-3xl">
                Qibla Finder
              </h2>

              <p className="mt-2 max-w-md text-xs leading-relaxed theme-muted">
                The bearing is calculated from your selected coordinates to
                the Kaaba using the great-circle initial bearing.
              </p>


              {!locationState || qiblaAngle === null ? (

                <div className="mt-6 w-full rounded-2xl border border-theme bg-theme-soft p-6">

                  <RiMapPinLine
                    size={30}
                    className="mx-auto mb-3 theme-accent"
                  />

                  <p className="text-sm font-bold theme-text">
                    Location required
                  </p>

                  <p className="mt-1 text-xs theme-muted">
                    Use your GPS location or search for a city to calculate
                    its Qibla direction.
                  </p>

                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locationStatus === "requesting"}
                    className="theme-button mt-4 min-h-10 !px-4 !py-2 text-xs font-bold"
                  >
                    {locationStatus === "requesting"
                      ? "Getting location..."
                      : "Use my location"}
                  </button>

                </div>

              ) : (

                <>

                  {/* QIBLA INFORMATION */}

                  <div className="mt-5 grid w-full grid-cols-2 gap-2 sm:max-w-md">

                    <div className="rounded-2xl border border-theme bg-theme-soft p-3">

                      <span className="block text-[10px] font-semibold uppercase tracking-wider theme-subtle">
                        Qibla bearing
                      </span>

                      <strong className="mt-1 block text-2xl font-black tabular-nums theme-accent">
                        {qiblaAngle.toFixed(1)}°
                      </strong>

                      <span className="text-[10px] theme-muted">
                        clockwise from true north
                      </span>

                    </div>


                    <div className="min-w-0 rounded-2xl border border-theme bg-theme-soft p-3">

                      <span className="block text-[10px] font-semibold uppercase tracking-wider theme-subtle">
                        Selected location
                      </span>

                      <strong className="mt-1 block truncate text-sm font-bold theme-text">
                        {locationState.city}
                      </strong>

                      <span className="block break-words text-[10px] theme-muted">
                        {locationState.latitude.toFixed(4)},{" "}
                        {locationState.longitude.toFixed(4)}
                      </span>

                    </div>

                  </div>


                  {/* COMPASS DIAL */}

                  <div
                    className="relative my-7 flex aspect-square w-full max-w-[min(76vw,320px)] items-center justify-center rounded-full border-[5px] border-theme bg-theme-soft shadow-inner"
                    role="img"
                    aria-label={`Qibla bearing ${qiblaAngle.toFixed(
                      1
                    )} degrees from true north`}
                  >

                    <span className="absolute top-3 text-xs font-black theme-accent">
                      N
                    </span>

                    <span className="absolute bottom-3 text-xs font-bold theme-subtle">
                      S
                    </span>

                    <span className="absolute right-3 text-xs font-bold theme-subtle">
                      E
                    </span>

                    <span className="absolute left-3 text-xs font-bold theme-subtle">
                      W
                    </span>

                    <div className="absolute inset-7 rounded-full border border-theme" />


                    {/* QIBLA NEEDLE */}

                    <div
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                      style={{
                        transform: `rotate(${
                          qiblaAngle -
                          (compassHeading !== null
                            ? compassHeading
                            : 0)
                        }deg)`,
                      }}
                    >

                      <div className="absolute top-[12%] flex -translate-y-1 flex-col items-center">

                        <span
                          className="text-3xl drop-shadow"
                          aria-hidden="true"
                        >
                          🕋
                        </span>

                        <span className="mt-1 h-16 w-1.5 rounded-full bg-gradient-to-t from-transparent to-accent" />

                      </div>

                    </div>


                    <div className="z-10 h-4 w-4 rounded-full border-2 border-[var(--bg-card)] bg-accent shadow" />

                  </div>


                  {/* COMPASS STATUS */}

                  {compassHeading !== null ? (

                    <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold theme-accent">

                      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />

                      Device heading detected:{" "}
                      {Math.round(compassHeading)}°

                    </p>

                  ) : (

                    <p className="mb-3 max-w-md rounded-xl border border-theme bg-theme-soft p-3 text-xs leading-relaxed theme-muted">

                      The displayed bearing is measured from true north.
                      Enable your phone's compass to rotate the indicator
                      relative to the device. Sensor readings may be magnetic
                      or affected by interference.

                    </p>

                  )}


                  {/* ENABLE COMPASS */}

                  <button
                    type="button"
                    onClick={enableCompass}
                    disabled={compassPermission === "requesting"}
                    className="theme-button flex min-h-11 w-full max-w-xs items-center justify-center gap-2 !py-3 text-sm font-bold"
                  >

                    {compassPermission === "requesting" ? (

                      <RiLoader4Line
                        size={17}
                        className="animate-spin"
                      />

                    ) : (

                      <RiCompass3Line size={17} />

                    )}

                    {compassHeading !== null
                      ? "Compass enabled"
                      : compassPermission === "requesting"
                        ? "Waiting for compass..."
                        : "Enable device compass"}

                  </button>


                  {compassError && (

                    <p
                      role="status"
                      className="mt-3 max-w-md text-xs leading-relaxed text-[var(--danger)]"
                    >
                      {compassError}
                    </p>

                  )}


                  <p className="mt-4 max-w-md text-[10px] leading-relaxed theme-subtle">
                    For best results, hold your phone flat and calibrate it
                    away from magnetic cases, vehicles, speakers and metal
                    objects. The phone's sensor may not point to true north;
                    use the numeric bearing as the reference.
                  </p>

                </>

              )}

            </section>

          </main>
        )}

      </div>


      {/* ======================================================
          CALCULATION SETTINGS MODAL
      ====================================================== */}

      {isMethodModalOpen && (

        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4"
          role="presentation"
        >

          <button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMethodModal}
          />


          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="prayer-settings-title"
            className="theme-card relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-theme p-5 shadow-2xl sm:p-6"
          >

            <h3
              id="prayer-settings-title"
              className="mb-1 text-lg font-bold theme-text"
            >
              Prayer Calculation Settings
            </h3>

            <p className="mb-4 text-xs theme-muted">
              Select the calculation convention and Asr juristic method
              used for your prayer timetable.
            </p>


            <div className="space-y-4">

              {/* CALCULATION METHOD */}

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider theme-secondary">
                  Calculation convention
                </label>

                <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">

                  {CALCULATION_METHODS.map((method) => (

                    <button
                      type="button"
                      key={method.id}
                      onClick={() =>
                        setCalculationMethod(method.id)
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                        calculationMethod === method.id
                          ? "bg-accent-soft text-accent"
                          : "theme-text hover:bg-theme-soft"
                      }`}
                    >

                      <span>{method.name}</span>

                      {calculationMethod === method.id && (
                        <span aria-label="Selected">✓</span>
                      )}

                    </button>

                  ))}

                </div>
              </div>


              {/* ASR METHOD */}

              <div className="border-t border-theme pt-3">

                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider theme-secondary">
                  Asr juristic method
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() => setAsrJuristic(1)}
                    aria-pressed={asrJuristic === 1}
                    className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                      asrJuristic === 1
                        ? "border-accent bg-accent text-[var(--accent-foreground)]"
                        : "border-theme theme-muted"
                    }`}
                  >
                    Hanafi (Shadow 2×)
                  </button>


                  <button
                    type="button"
                    onClick={() => setAsrJuristic(0)}
                    aria-pressed={asrJuristic === 0}
                    className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                      asrJuristic === 0
                        ? "border-accent bg-accent text-[var(--accent-foreground)]"
                        : "border-theme theme-muted"
                    }`}
                  >
                    Standard (Shadow 1×)
                  </button>

                </div>
              </div>

            </div>


            <button
              type="button"
              onClick={closeMethodModal}
              className="theme-button mt-6 min-h-10 w-full !py-2.5 text-xs font-bold"
            >
              Done
            </button>

          </section>
        </div>
      )}


      <Footer />

    </div>
  );
};

export default PrayerTimes;
