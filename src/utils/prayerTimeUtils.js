export const KAABA_COORDS = Object.freeze({
  latitude: 21.422487,
  longitude: 39.826206,
});

export const KAABA_COORDINATES = KAABA_COORDS;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const MINUTES_PER_DAY = 24 * 60;


// ============================================================
// 2. COORDINATE VALIDATION
// ============================================================

export const isValidCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};


// ============================================================
// 3. GET USER'S CURRENT GPS LOCATION
// ============================================================

/**
 * Requests the user's current location using browser GPS.
 *
 * IMPORTANT:
 * - Website must use HTTPS (localhost also works).
 * - User must allow location permission.
 * - GPS accuracy depends on the device and environment.
 *
 * Returns:
 * {
 *   latitude: number,
 *   longitude: number,
 *   accuracy: number
 * }
 */

export const getCurrentLocation = ({
  enableHighAccuracy = true,
  timeout = 15000,
  maximumAge = 0,
} = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" ||
        !navigator.geolocation) {
      reject(
        new Error("Geolocation is not supported by this browser.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (!isValidCoordinates(latitude, longitude)) {
          reject(new Error("The device returned invalid coordinates."));
          return;
        }

        resolve({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });
      },

      (error) => {
        let message = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access.";
            break;

          case error.POSITION_UNAVAILABLE:
            message =
              "Your current location is unavailable. Please try again.";
            break;

          case error.TIMEOUT:
            message =
              "Location request timed out. Please try again.";
            break;

          default:
            message = error.message || message;
        }

        reject(new Error(message));
      },

      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  });
};


// ============================================================
// 4. CALCULATE QIBLA BEARING
// ============================================================

/**
 * Calculates the initial great-circle bearing from the user's
 * coordinates to the Kaaba.
 *
 * Result:
 * 0°   = North
 * 90°  = East
 * 180° = South
 * 270° = West
 *
 * Returns a number between 0 and 360.
 */

export const calculateQiblaAngle = (latitude, longitude) => {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new TypeError(
      "Valid latitude and longitude are required."
    );
  }

  const userLat = Number(latitude) * DEG_TO_RAD;
  const userLon = Number(longitude) * DEG_TO_RAD;

  const kaabaLat = KAABA_COORDS.latitude * DEG_TO_RAD;
  const kaabaLon = KAABA_COORDS.longitude * DEG_TO_RAD;

  const deltaLon = kaabaLon - userLon;

  const y = Math.sin(deltaLon);

  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(deltaLon);

  // Direction is undefined at the Kaaba itself.
  if (Math.abs(x) < 1e-12 && Math.abs(y) < 1e-12) {
    return 0;
  }

  const bearing = Math.atan2(y, x) * RAD_TO_DEG;

  return (bearing + 360) % 360;
};


// ============================================================
// 5. GET QIBLA DIRECTION DIRECTLY FROM GPS
// ============================================================

/**
 * Gets the user's GPS location and calculates Qibla bearing.
 *
 * Usage:
 * const result = await getQiblaDirection();
 *
 * result.latitude
 * result.longitude
 * result.accuracy
 * result.qiblaAngle
 */

export const getQiblaDirection = async (locationOptions = {}) => {
  const location = await getCurrentLocation(locationOptions);

  const qiblaAngle = calculateQiblaAngle(
    location.latitude,
    location.longitude
  );

  return {
    ...location,
    qiblaAngle,
  };
};


// ============================================================
// 6. NORMALIZE ANGLES
// ============================================================

/**
 * Converts any angle into the 0–360 degree range.
 */

export const normalizeAngle = (angle) => {
  if (!Number.isFinite(Number(angle))) {
    throw new TypeError("A valid angle is required.");
  }

  return ((Number(angle) % 360) + 360) % 360;
};


// ============================================================
// 7. CALCULATE SHORTEST ANGULAR DIFFERENCE
// ============================================================

/**
 * Calculates the shortest signed difference between
 * current phone heading and Qibla bearing.
 *
 * Positive = turn clockwise.
 * Negative = turn counterclockwise.
 */

export const getQiblaRotation = (qiblaAngle, deviceHeading) => {
  const qibla = normalizeAngle(qiblaAngle);
  const heading = normalizeAngle(deviceHeading);

  return ((qibla - heading + 540) % 360) - 180;
};


// ============================================================
// 8. PARSE PRAYER TIME
// ============================================================

/**
 * Converts prayer time strings into today's local Date.
 *
 * Supported:
 * "05:20"
 * "17:42"
 * "05:20 (PKT)"
 * "17:42:00"
 * "5:20 AM"
 * "5:20 PM"
 *
 * Uses the device's local timezone.
 */

export const parseTimeToDate = (
  timeStr,
  baseDate = new Date()
) => {
  if (typeof timeStr !== "string" || !timeStr.trim()) {
    throw new TypeError("A valid prayer time string is required.");
  }

  if (
    !(baseDate instanceof Date) ||
    Number.isNaN(baseDate.getTime())
  ) {
    throw new TypeError("A valid base date is required.");
  }

  // Remove timezone labels such as (PKT).
  const cleanTime = timeStr
    .trim()
    .replace(/\s*\([^)]*\)/g, "")
    .trim();

  const match = cleanTime.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (!match) {
    throw new TypeError(
      `Invalid prayer time format: ${timeStr}`
    );
  }

  let hours = Number(match[1]);

  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);

  const meridiem = match[4]?.toUpperCase();

  if (minutes > 59 || seconds > 59) {
    throw new RangeError("Invalid minutes or seconds.");
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      throw new RangeError("Invalid 12-hour time.");
    }

    hours = hours % 12;

    if (meridiem === "PM") {
      hours += 12;
    }
  } else if (hours < 0 || hours > 23) {
    throw new RangeError("Invalid 24-hour time.");
  }

  const result = new Date(baseDate);

  result.setHours(hours, minutes, seconds, 0);

  return result;
};


// ============================================================
// 9. FORMAT TIME
// ============================================================

/**
 * Formats Date into a readable 12-hour time.
 *
 * Example: 05:20 AM
 */

export const formatTime12Hour = (dateObj) => {
  if (
    !(dateObj instanceof Date) ||
    Number.isNaN(dateObj.getTime())
  ) {
    throw new TypeError("A valid Date object is required.");
  }

  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


// ============================================================
// 10. ADD MINUTES WITHOUT MUTATING ORIGINAL DATE
// ============================================================

const addMinutes = (date, minutes) => {
  return new Date(
    date.getTime() + minutes * 60 * 1000
  );
};


// ============================================================
// 11. DERIVE EXTRA PRAYER WINDOWS
// ============================================================

/**
 * Approximate display windows:
 *
 * Ishraq:
 * 18–45 minutes after sunrise.
 *
 * Chaasht / Duha:
 * 50 minutes after sunrise until 15 minutes before Dhuhr.
 *
 * Zawal:
 * 10 minutes immediately before the supplied Dhuhr time.
 *
 * These are estimates, not independently calculated
 * religious prayer-time rulings.
 */

export const deriveExtraPrayerTimes = (
  sunriseTimeStr,
  dhuhrTimeStr,
  baseDate = new Date()
) => {
  if (!sunriseTimeStr || !dhuhrTimeStr) {
    return null;
  }

  try {
    const sunrise = parseTimeToDate(
      sunriseTimeStr,
      baseDate
    );

    let dhuhr = parseTimeToDate(
      dhuhrTimeStr,
      baseDate
    );

    // Handle midnight/date-boundary differences.
    if (dhuhr.getTime() <= sunrise.getTime()) {
      dhuhr = addMinutes(dhuhr, MINUTES_PER_DAY);
    }

    const ishraqStart = addMinutes(sunrise, 18);
    const ishraqEnd = addMinutes(sunrise, 45);

    const chaashtStart = addMinutes(sunrise, 50);

    const zawalStart = addMinutes(dhuhr, -10);
    const zawalEnd = dhuhr;

    const chaashtEnd = addMinutes(zawalStart, -5);

    if (
      chaashtEnd <= chaashtStart ||
      ishraqEnd <= ishraqStart
    ) {
      return null;
    }

    return {
      ishraq:
        `${formatTime12Hour(ishraqStart)} - ` +
        `${formatTime12Hour(ishraqEnd)}`,

      chaasht:
        `${formatTime12Hour(chaashtStart)} - ` +
        `${formatTime12Hour(chaashtEnd)}`,

      zawal:
        `${formatTime12Hour(zawalStart)} - ` +
        `${formatTime12Hour(zawalEnd)}`,
    };

  } catch (error) {
    console.error(
      "Error calculating extra prayer times:",
      error
    );

    return null;
  }
};


// ============================================================
// 12. ALADHAN CALCULATION METHODS
// ============================================================

export const CALCULATION_METHODS = Object.freeze([
  {
    id: 1,
    name: "University of Islamic Sciences, Karachi",
  },
  {
    id: 2,
    name: "Islamic Society of North America (ISNA)",
  },
  {
    id: 3,
    name: "Muslim World League (MWL)",
  },
  {
    id: 4,
    name: "Umm Al-Qura University, Makkah",
  },
  {
    id: 5,
    name: "Egyptian General Authority of Survey",
  },
  {
    id: 7,
    name: "Institute of Geophysics, University of Tehran",
  },
  {
    id: 8,
    name: "Gulf Region",
  },
  {
    id: 9,
    name: "Kuwait",
  },
  {
    id: 10,
    name: "Qatar",
  },
  {
    id: 11,
    name: "Majlis Ugama Islam Singapura, Singapore",
  },
  {
    id: 12,
    name: "Union des Organisations Islamiques de France",
  },
  {
    id: 13,
    name: "Diyanet İşleri Başkanlığı, Turkey",
  },
  {
    id: 14,
    name: "Spiritual Administration of Muslims of Russia",
  },
  {
    id: 15,
    name: "Moonsighting Committee Worldwide",
  },
  {
    id: 16,
    name: "Dubai",
  },
  {
    id: 17,
    name: "Jabatan Kemajuan Islam Malaysia (JAKIM)",
  },
  {
    id: 18,
    name: "Tunisia",
  },
  {
    id: 19,
    name: "Algeria",
  },
  {
    id: 20,
    name: "Kementerian Agama Republik Indonesia",
  },
  {
    id: 21,
    name: "Morocco",
  },
  {
    id: 22,
    name: "Comunidade Islâmica de Lisboa",
  },
  {
    id: 23,
    name: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan",
  },
]);
