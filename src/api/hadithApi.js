const BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

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

// Simple in-memory caches to prevent redundant CDN fetches
const booksCache = new Map();
const hadithsCache = new Map();

/**
 * Normalizes scholar grades from the API or applies canonical status for Bukhari & Muslim
 */
const resolveHadithGrade = (grades = [], editionObj) => {
  if (editionObj.defaultGrade) {
    return {
      gradeLabel: editionObj.defaultGrade,
      isAuthentic: true,
      grades: grades.length > 0 ? grades : [{ name: "Consensus", grade: editionObj.defaultGrade }],
    };
  }

  if (Array.isArray(grades) && grades.length > 0) {
    const primary = grades[0];
    const label = primary.grade ? `${primary.grade}${primary.name ? ` (${primary.name})` : ""}` : "Graded";
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

/**
 * Fetch sections / books of a specific Hadith collection
 */
export const fetchCollectionBooks = async (collectionKey = "bukhari") => {
  if (booksCache.has(collectionKey)) {
    return booksCache.get(collectionKey);
  }

  const editionObj = HADITH_EDITIONS[collectionKey] || HADITH_EDITIONS.bukhari;

  try {
    const res = await fetch(`${BASE_URL}/editions/${editionObj.edition}/sections.json`);
    if (!res.ok) throw new Error("Network response failed");
    const data = await res.json();

    const rawSections = data.sections || data.metadata?.sections || data;
    const normalized = {};

    if (rawSections && typeof rawSections === "object") {
      Object.entries(rawSections).forEach(([k, v]) => {
        if (k !== "0" && v && typeof v === "string" && v.trim() !== "") {
          normalized[k] = v.trim();
        }
      });
    }

    booksCache.set(collectionKey, normalized);
    return normalized;
  } catch (error) {
    console.error("fetchCollectionBooks error:", error);
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

  try {
    const [engRes, araRes, urdRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/editions/${editionObj.edition}/sections/${bookNumber}.json`),
      fetch(`${BASE_URL}/editions/${editionObj.arabicEdition}/sections/${bookNumber}.json`),
      fetch(`${BASE_URL}/editions/${editionObj.urduEdition}/sections/${bookNumber}.json`),
    ]);

    let hadithsList = [];
    if (engRes.status === "fulfilled" && engRes.value.ok) {
      const engData = await engRes.value.json();
      hadithsList = (engData.hadiths || []).filter(
        (h) => h && typeof h.text === "string" && h.text.trim().length > 0
      );
    }

    const arabicMap = new Map();
    if (araRes.status === "fulfilled" && araRes.value.ok) {
      const araData = await araRes.value.json();
      (araData.hadiths || []).forEach((h) => {
        if (h.text) arabicMap.set(h.hadithnumber, h.text.trim());
      });
    }

    const urduMap = new Map();
    if (urdRes.status === "fulfilled" && urdRes.value.ok) {
      const urdData = await urdRes.value.json();
      (urdData.hadiths || []).forEach((h) => {
        if (h.text) urduMap.set(h.hadithnumber, h.text.trim());
      });
    }

    const formatted = hadithsList.map((h) => {
      const grading = resolveHadithGrade(h.grades, editionObj);
      return {
        id: `${collectionKey}-${h.hadithnumber}`,
        hadithNumber: h.hadithnumber,
        arabic: arabicMap.get(h.hadithnumber) || "",
        english: h.text.trim(),
        urdu:
          urduMap.get(h.hadithnumber) ||
          "اس حدیث کا اردو ترجمہ جلد شامل کیا جائے گا۔",
        collection: collectionKey,
        collectionName: editionObj.name,
        reference: `${editionObj.name} #${h.hadithnumber}`,
        gradeLabel: grading.gradeLabel,
        isAuthentic: grading.isAuthentic,
        grades: grading.grades,
      };
    });

    hadithsCache.set(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.error("fetchHadithsByBook error:", error);
    return [];
  }
};

/**
 * Direct lookup by Hadith Number (Arabic, English, and Urdu)
 */
export const fetchSingleHadith = async (collectionKey = "bukhari", hadithNumber = 1) => {
  const editionObj = HADITH_EDITIONS[collectionKey] || HADITH_EDITIONS.bukhari;

  const [engRes, araRes, urdRes] = await Promise.allSettled([
    fetch(`${BASE_URL}/editions/${editionObj.edition}/${hadithNumber}.json`),
    fetch(`${BASE_URL}/editions/${editionObj.arabicEdition}/${hadithNumber}.json`),
    fetch(`${BASE_URL}/editions/${editionObj.urduEdition}/${hadithNumber}.json`),
  ]);

  if (engRes.status !== "fulfilled" || !engRes.value.ok) {
    throw new Error("Hadith not found");
  }

  const engData = await engRes.value.json();
  const araData =
    araRes.status === "fulfilled" && araRes.value.ok ? await araRes.value.json() : null;
  const urdData =
    urdRes.status === "fulfilled" && urdRes.value.ok ? await urdRes.value.json() : null;

  const h =
    engData.hadiths?.find((item) => Number(item.hadithnumber) === Number(hadithNumber)) ||
    engData.hadiths?.[0] ||
    engData;

  if (!h?.text || !h.text.trim()) {
    throw new Error("Hadith text unavailable");
  }

  const araText =
    araData?.hadiths?.find((item) => Number(item.hadithnumber) === Number(hadithNumber))?.text ||
    araData?.hadiths?.[0]?.text ||
    araData?.text ||
    "";

  const urdText =
    urdData?.hadiths?.find((item) => Number(item.hadithnumber) === Number(hadithNumber))?.text ||
    urdData?.hadiths?.[0]?.text ||
    urdData?.text ||
    "اس حدیث کا اردو ترجمہ جلد شامل کیا جائے گا۔";

  const grading = resolveHadithGrade(h.grades, editionObj);

  return {
    id: `${collectionKey}-${hadithNumber}`,
    hadithNumber,
    arabic: araText.trim(),
    english: h.text.trim(),
    urdu: urdText.trim(),
    collection: collectionKey,
    collectionName: editionObj.name,
    reference: `${editionObj.name} #${hadithNumber}`,
    gradeLabel: grading.gradeLabel,
    isAuthentic: grading.isAuthentic,
    grades: grading.grades,
  };
};