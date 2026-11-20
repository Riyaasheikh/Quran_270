const BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const FALLBACK_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1";

export const HADITH_EDITIONS = {
  bukhari: {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    edition: "eng-bukhari",
    arabicEdition: "ara-bukhari",
    urduEdition: "urd-bukhari",
    authenticityStatus: "Sahih (Canonical)",
    defaultGrade: "Sahih (Authentic)",
  },
  muslim: {
    id: "muslim",
    name: "Sahih Muslim",
    edition: "eng-muslim",
    arabicEdition: "ara-muslim",
    urduEdition: "urd-muslim",
    authenticityStatus: "Sahih (Canonical)",
    defaultGrade: "Sahih (Authentic)",
  },
  tirmidhi: {
    id: "tirmidhi",
    name: "Jami` at-Tirmidhi",
    edition: "eng-tirmidhi",
    arabicEdition: "ara-tirmidhi",
    urduEdition: "urd-tirmidhi",
    authenticityStatus: "Graded Sunan",
    defaultGrade: null,
  },
  abudawud: {
    id: "abudawud",
    name: "Sunan Abi Dawud",
    edition: "eng-abudawud",
    arabicEdition: "ara-abudawud",
    urduEdition: "urd-abudawud",
    authenticityStatus: "Graded Sunan",
    defaultGrade: null,
  },
  nasai: {
    id: "nasai",
    name: "Sunan an-Nasa'i",
    edition: "eng-nasai",
    arabicEdition: "ara-nasai",
    urduEdition: "urd-nasai",
    authenticityStatus: "Graded Sunan",
    defaultGrade: null,
  },
  ibnmajah: {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    edition: "eng-ibnmajah",
    arabicEdition: "ara-ibnmajah",
    urduEdition: "urd-ibnmajah",
    authenticityStatus: "Graded Sunan",
    defaultGrade: null,
  },
};

const booksCache = new Map();
const hadithsCache = new Map();
const singleHadithCache = new Map();

const fetchJsonWithFallback = async (path) => {
  const cleanPath = path.replace(/^\/+/, "");
  try {
    const res = await fetch(`${BASE_URL}/${cleanPath}`, { cache: "default" });
    if (res.ok) return await res.json();
  } catch {
    // Fallback to raw GitHub mirror if jsDelivr has a temporary edge issue
  }

  const fallbackRes = await fetch(`${FALLBACK_URL}/${cleanPath}`, { cache: "default" });
  if (!fallbackRes.ok) {
    throw new Error(`HTTP ${fallbackRes.status} for ${cleanPath}`);
  }
  return await fallbackRes.json();
};

const resolveHadithGrade = (grades = [], editionObj) => {
  if (editionObj.defaultGrade) {
    return {
      gradeLabel: editionObj.defaultGrade,
      isAuthentic: true,
      grades:
        Array.isArray(grades) && grades.length > 0
          ? grades
          : [{ name: "Consensus", grade: editionObj.defaultGrade }],
    };
  }

  if (Array.isArray(grades) && grades.length > 0) {
    const primary = grades[0];
    const label = primary.grade
      ? `${primary.grade}${primary.name ? ` (${primary.name})` : ""}`
      : "Graded";
    const lower = label.toLowerCase();
    const isAuthentic = lower.includes("sahih") || lower.includes("hasan");

    return {
      gradeLabel: label,
      isAuthentic,
      grades,
    };
  }

  return {
    gradeLabel: "Check Scholar Grading",
    isAuthentic: null,
    grades: [],
  };
};

const extractHadithItem = (data, targetNumber) => {
  if (!data) return null;
  if (Array.isArray(data.hadiths)) {
    const exact = data.hadiths.find(
      (item) => String(item.hadithnumber) === String(targetNumber)
    );
    return exact || data.hadiths[0] || null;
  }
  if (typeof data.text === "string") return data;
  return null;
};

/**
 * Fetch sections / books of a specific Hadith collection
 */
export const fetchCollectionBooks = async (collectionKey = "bukhari") => {
  if (booksCache.has(collectionKey)) {
    return booksCache.get(collectionKey);
  }

  const editionObj = HADITH_EDITIONS[collectionKey] || HADITH_EDITIONS.bukhari;

  try {
    const data = await fetchJsonWithFallback(
      `editions/${editionObj.edition}/sections.json`
    );

    const rawSections = data.sections || data.metadata?.sections || data;
    const normalized = {};

    if (rawSections && typeof rawSections === "object") {
      Object.entries(rawSections).forEach(([k, v]) => {
        if (k !== "0" && v && typeof v === "string" && v.trim() !== "") {
          normalized[k] = v.trim();
        }
      });
    }

    if (Object.keys(normalized).length === 0) {
      throw new Error("Empty sections returned");
    }

    booksCache.set(collectionKey, normalized);
    return normalized;
  } catch (error) {
    console.warn("fetchCollectionBooks fallback used:", error?.message || error);
    return {
      1: "Revelation",
      2: "Belief",
      3: "Knowledge",
      8: "Prayers (Salat)",
      9: "Times of the Prayers",
      10: "Call to Prayer (Adhaan)",
      24: "Obligatory Charity (Zakat)",
      31: "Fasting",
      67: "Wedlock, Marriage (Nikaah)",
      68: "Divorce",
      78: "Good Manners and Form (Al-Adab)",
      80: "Invocations",
    };
  }
};

/**
 * Fetches Hadiths in a book with English, Arabic, and Urdu merged
 */
export const fetchHadithsByBook = async (collectionKey = "bukhari", bookNumber = 1) => {
  const cacheKey = `${collectionKey}-${bookNumber}`;
  if (hadithsCache.has(cacheKey)) {
    return hadithsCache.get(cacheKey);
  }

  const editionObj = HADITH_EDITIONS[collectionKey] || HADITH_EDITIONS.bukhari;

  const [engRes, araRes, urdRes] = await Promise.allSettled([
    fetchJsonWithFallback(`editions/${editionObj.edition}/sections/${bookNumber}.json`),
    fetchJsonWithFallback(`editions/${editionObj.arabicEdition}/sections/${bookNumber}.json`),
    fetchJsonWithFallback(`editions/${editionObj.urduEdition}/sections/${bookNumber}.json`),
  ]);

  let hadithsList = [];
  if (engRes.status === "fulfilled") {
    hadithsList = (engRes.value?.hadiths || []).filter(
      (h) => h && typeof h.text === "string" && h.text.trim().length > 0
    );
  }

  const arabicMap = new Map();
  if (araRes.status === "fulfilled") {
    (araRes.value?.hadiths || []).forEach((h) => {
      if (h?.text) arabicMap.set(String(h.hadithnumber), h.text.trim());
    });
  }

  const urduMap = new Map();
  if (urdRes.status === "fulfilled") {
    (urdRes.value?.hadiths || []).forEach((h) => {
      if (h?.text) urduMap.set(String(h.hadithnumber), h.text.trim());
    });
  }

  const formatted = hadithsList.map((h) => {
    const keyNum = String(h.hadithnumber);
    const grading = resolveHadithGrade(h.grades, editionObj);
    return {
      id: `${collectionKey}-${keyNum}`,
      hadithNumber: h.hadithnumber,
      arabic: arabicMap.get(keyNum) || "",
      english: h.text.trim(),
      urdu:
        urduMap.get(keyNum) ||
        "اس حدیث کا اردو ترجمہ جلد شامل کیا جائے گا۔",
      collection: collectionKey,
      collectionName: editionObj.name,
      reference: `${editionObj.name} #${h.hadithnumber}`,
      gradeLabel: grading.gradeLabel,
      isAuthentic: grading.isAuthentic,
      grades: grading.grades,
    };
  });

  if (formatted.length > 0) {
    hadithsCache.set(cacheKey, formatted);
  }

  return formatted;
};

/**
 * Direct lookup by Hadith Number (Arabic, English, and Urdu)
 */
export const fetchSingleHadith = async (collectionKey = "bukhari", hadithNumber = 1) => {
  const numStr = String(hadithNumber).trim();
  const cacheKey = `single-${collectionKey}-${numStr}`;
  if (singleHadithCache.has(cacheKey)) {
    return singleHadithCache.get(cacheKey);
  }

  const editionObj = HADITH_EDITIONS[collectionKey] || HADITH_EDITIONS.bukhari;

  const [engRes, araRes, urdRes] = await Promise.allSettled([
    fetchJsonWithFallback(`editions/${editionObj.edition}/${numStr}.json`),
    fetchJsonWithFallback(`editions/${editionObj.arabicEdition}/${numStr}.json`),
    fetchJsonWithFallback(`editions/${editionObj.urduEdition}/${numStr}.json`),
  ]);

  if (engRes.status !== "fulfilled") {
    throw new Error("Hadith not found");
  }

  const h = extractHadithItem(engRes.value, numStr);
  if (!h?.text || !h.text.trim()) {
    throw new Error("Hadith text unavailable");
  }

  const araItem = araRes.status === "fulfilled" ? extractHadithItem(araRes.value, numStr) : null;
  const urdItem = urdRes.status === "fulfilled" ? extractHadithItem(urdRes.value, numStr) : null;

  const grading = resolveHadithGrade(h.grades, editionObj);

  const result = {
    id: `${collectionKey}-${numStr}`,
    hadithNumber: h.hadithnumber ?? numStr,
    arabic: (araItem?.text || "").trim(),
    english: h.text.trim(),
    urdu:
      (urdItem?.text || "").trim() ||
      "اس حدیث کا اردو ترجمہ جلد شامل کیا جائے گا۔",
    collection: collectionKey,
    collectionName: editionObj.name,
    reference: `${editionObj.name} #${h.hadithnumber ?? numStr}`,
    gradeLabel: grading.gradeLabel,
    isAuthentic: grading.isAuthentic,
    grades: grading.grades,
  };

  singleHadithCache.set(cacheKey, result);
  return result;
};