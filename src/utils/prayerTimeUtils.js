// Kaaba exact coordinates
export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

// Calculate Great Circle Bearings toward Mecca
export const calculateQiblaAngle = (latitude, longitude) => {
  const phiK = (KAABA_COORDS.latitude * Math.PI) / 180.0;
  const lambdaK = (KAABA_COORDS.longitude * Math.PI) / 180.0;
  const phi = (latitude * Math.PI) / 180.0;
  const lambda = (longitude * Math.PI) / 180.0;

  const numerator = Math.sin(lambdaK - lambda);
  const denominator =
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

  let qiblaRad = Math.atan2(numerator, denominator);
  let qiblaDeg = (qiblaRad * 180.0) / Math.PI;

  return (qiblaDeg + 360.0) % 360.0;
};

// Convert "HH:MM" (24h) to a JavaScript Date object for today
export const parseTimeToDate = (timeStr) => {
  if (!timeStr) return new Date();
  const cleanTime = timeStr.split(" ")[0]; // remove timezone strings like "(PKT)"
  const [hours, minutes] = cleanTime.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Format Date object back to clean "hh:mm A" string
export const formatTime12Hour = (dateObj) => {
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Derive Ishraq, Chaasht, and Zawal from Sunrise & Dhuhr
export const deriveExtraPrayerTimes = (sunriseTimeStr, dhuhrTimeStr) => {
  if (!sunriseTimeStr || !dhuhrTimeStr) return null;

  const sunriseDate = parseTimeToDate(sunriseTimeStr);
  const dhuhrDate = parseTimeToDate(dhuhrTimeStr);

  // Ishraq: 15-20 minutes after Sunrise
  const ishraqStart = new Date(sunriseDate.getTime() + 18 * 60 * 1000);
  const ishraqEnd = new Date(sunriseDate.getTime() + 45 * 60 * 1000);

  // Zawal (Makruh Time): 10-12 minutes immediately preceding Dhuhr
  const zawalStart = new Date(dhuhrDate.getTime() - 10 * 60 * 1000);
  const zawalEnd = new Date(dhuhrDate.getTime());

  // Chaasht (Salat al-Duha): mid-morning until Zawal starts
  const chaashtStart = new Date(sunriseDate.getTime() + 50 * 60 * 1000);
  const chaashtEnd = new Date(zawalStart.getTime() - 5 * 60 * 1000);

  return {
    ishraq: `${formatTime12Hour(ishraqStart)} - ${formatTime12Hour(ishraqEnd)}`,
    chaasht: `${formatTime12Hour(chaashtStart)} - ${formatTime12Hour(chaashtEnd)}`,
    zawal: `${formatTime12Hour(zawalStart)} - ${formatTime12Hour(zawalEnd)}`,
  };
};

export const CALCULATION_METHODS = [
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League (MWL)" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 12, name: "Union des Organisations Islamiques de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
];