// Shared constants + helpers for the Mosque Finder feature.

export const FACILITIES = [
  { key: "womenSection", apiKey: "has_women_section", label: "Women's prayer area", short: "Women's area", emoji: "🧕" },
  { key: "wuduArea", apiKey: "has_wudu_area", label: "Wudu / washroom", short: "Wudu", emoji: "💧" },
  { key: "jumuah", apiKey: "has_jumuah", label: "Jumu'ah (Friday) prayer", short: "Jumu'ah", emoji: "🗓️" },
  { key: "wheelchair", apiKey: "has_wheelchair_access", label: "Wheelchair accessible", short: "Wheelchair", emoji: "♿" },
  { key: "parking", apiKey: "has_parking", label: "Parking", short: "Parking", emoji: "🅿️" },
  { key: "ac", apiKey: "has_ac", label: "Air conditioned", short: "AC", emoji: "❄️" },
];

export const PRAYERS = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

export const JAMAAH_FIELDS = [...PRAYERS, { key: "jumuah", label: "Jumu'ah" }];

// "4:05", "04:05:00" -> "04:05". Anything invalid -> null
export function normalizeTime(value) {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value));
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

// "16:15" -> "4:15 PM"
export function formatTime12(value) {
  const t = normalizeTime(value);
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function toMinutes(value) {
  const t = normalizeTime(value);
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Finds the next jama'ah a person can still catch. On Fridays, Jumu'ah replaces Dhuhr.
export function getNextJamaah(jamaah, now = new Date()) {
  if (!jamaah) return null;
  const isFriday = now.getDay() === 5;
  const useJumuah = isFriday && jamaah.jumuah;

  const schedule = [
    { key: "fajr", label: "Fajr", time: jamaah.fajr },
    {
      key: "dhuhr",
      label: useJumuah ? "Jumu'ah" : "Dhuhr",
      time: useJumuah ? jamaah.jumuah : jamaah.dhuhr,
    },
    { key: "asr", label: "Asr", time: jamaah.asr },
    { key: "maghrib", label: "Maghrib", time: jamaah.maghrib },
    { key: "isha", label: "Isha", time: jamaah.isha },
  ]
    .map((p) => ({ ...p, minutes: toMinutes(p.time) }))
    .filter((p) => p.minutes !== null);

  if (schedule.length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = schedule.find((p) => p.minutes >= nowMinutes);

  if (upcoming) {
    return { ...upcoming, inMinutes: upcoming.minutes - nowMinutes, tomorrow: false };
  }
  const first = schedule[0];
  return { ...first, inMinutes: first.minutes + 1440 - nowMinutes, tomorrow: true };
}

export function formatCountdown(minutes) {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `in ${h} h ${m} min` : `in ${h} h`;
}

export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  return "over a year ago";
}

// Walk if it's close, otherwise drive
export function travelEstimate(mosque) {
  if (mosque.distanceKm <= 1.5) {
    return { mode: "walking", label: `${mosque.walkingMinutes} min walk` };
  }
  return { mode: "driving", label: `${mosque.drivingMinutes} min drive` };
}

export function getDirectionsUrl(mosque) {
  const { mode } = travelEstimate(mosque);
  return `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}&travelmode=${mode}`;
}