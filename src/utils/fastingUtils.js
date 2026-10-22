// LocalStorage Keys
const STORAGE_KEY = "deen360_fasting_records";

export const FAST_TYPES = {
  RAMADAN: "Ramadan",
  MON_THU: "Monday / Thursday Sunnah",
  AYYAM_AL_BEED: "Ayyam al-Beed (White Days)",
  MISSED_QADHA: "Missed / Qadha Makeup",
  VOLUNTARY: "Custom Voluntary",
};

// Retrieve records from localStorage
export const getFastingRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

// Save records
export const saveFastingRecord = (record) => {
  const existing = getFastingRecords();
  const dateKey = record.date; // "YYYY-MM-DD"
  const filtered = existing.filter((r) => r.date !== dateKey);
  const updated = [record, ...filtered];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Toggle today's fast
export const toggleTodayFast = (suhoorTime = "04:37", iftarTime = "18:21", type = FAST_TYPES.RAMADAN) => {
  const todayKey = new Date().toISOString().split("T")[0];
  const existing = getFastingRecords();
  const todayRecord = existing.find((r) => r.date === todayKey);

  let updated;
  if (todayRecord) {
    // Delete record if already completed (toggle off)
    updated = existing.filter((r) => r.date !== todayKey);
  } else {
    // Add new completed fast
    const newRecord = {
      id: Date.now(),
      date: todayKey,
      type: type,
      status: "completed",
      suhoor_time: suhoorTime,
      iftar_time: iftarTime,
      notes: "",
    };
    updated = [newRecord, ...existing];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Calculate streak
export const calculateFastingStreak = (records = []) => {
  if (!records || records.length === 0) return 0;

  const sortedDates = records
    .filter((r) => r.status === "completed")
    .map((r) => r.date)
    .sort()
    .reverse();

  if (sortedDates.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();
  const todayStr = checkDate.toISOString().split("T")[0];

  // If not fasted today, check if yesterday had a record
  if (!sortedDates.includes(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Detect if today is a Sunnah fasting day
export const getVoluntaryFastingBadges = (hijriDay) => {
  const dayOfWeek = new Date().getDay(); // 1 = Monday, 4 = Thursday
  const badges = [];

  if (dayOfWeek === 1 || dayOfWeek === 4) {
    badges.push("Sunnah Fast (Mon/Thu)");
  }

  if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
    badges.push("Ayyam al-Beed (13-15)");
  }

  return badges;
};