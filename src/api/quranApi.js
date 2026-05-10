import axios from "axios";

const quranApi = axios.create({
  baseURL: "https://api.quran.com/api/v4",
  headers: {
    Accept: "application/json",
  },
});

export const fetchChapters = async () => {
  const response = await quranApi.get("/chapters?language=en");
  return response.data.chapters;
};
// api/quranApi.js

export const fetchSurahVerses = async (chapterId, translationId = "85") => {
  const response = await quranApi.get(`/verses/by_chapter/${chapterId}`, {
    params: {
      language: "en",
      words: true,
      translations: translationId, // Dynamic ID
      fields: "text_uthmani,page_number,juz_number",
      per_page: 300,
    },
  });
  return response.data.verses;
};

// Add this to fetch the list of all available translations
export const fetchAvailableTranslations = async () => {
  const response = await quranApi.get("/resources/translations");
  return response.data.translations;
};

export const fetchChapterDetail = async (chapterId) => {
  const response = await quranApi.get(`/chapters/${chapterId}?language=en`);
  return response.data.chapter;
};

// Fetches verses for a specific Juz (Continuous reading)
export const fetchVersesByJuz = async (juzId) => {
  const response = await quranApi.get(`/verses/by_juz/${juzId}`, {
    params: {
      language: "en",
      translations: "85", 
      fields: "text_uthmani,verse_key,chapter_id",
      per_page: 300, 
    },
  });
  return response.data.verses;
};
export const searchQuran = async (query) => {

  const response = await quranApi.get(`/search`, {

    params: { q: query, language: "en", size:5 },

  });

  return response.data.search.results;

};

// Add to api/quranApi.js

export const fetchSpecificVerse = async (verseKey, translationId = "85") => {
  try {
    const response = await quranApi.get(`/verses/by_key/${verseKey}`, {
      params: {
        language: "en",
        translations: translationId,
        fields: "text_uthmani",
      },
    });
    return response.data.verse;
  } catch (error) {
    return null;
  }
};

export const getPageImageUrl = (pageNumber) => {
  const paddedPage = String(pageNumber).padStart(3, '0');
  return `https://static.quran.com/images/pages/mushaf/v2/${paddedPage}.png`; // use paddedPage
};

// api/quranApi.js
// api/quranApi.js

export const getChapterSuggestions = (chapters, query) => {
  if (!query || !Array.isArray(chapters)) return [];

  const q = query.toLowerCase().trim();

  // remove words like "surah"
  const cleaned = q
    .replace("surah", "")
    .replace("surat", "")
    .trim();

  return chapters.filter((c) => {
    return (
      c.name_simple?.toLowerCase().includes(cleaned) ||
      c.name_arabic?.includes(cleaned) ||
      c.translated_name?.name?.toLowerCase().includes(cleaned) ||
      c.id.toString() === cleaned
    );
  });
};

   export const juzList = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Juz ${i + 1}`,
}));
 export const getJuzSuggestions = (query) => {
  if (!query) return [];

  const q = query.toLowerCase().trim();

  const juzNumber = q.match(/\d+/)?.[0];

  if (
    q.includes("juz") ||
    q.includes("para") ||
    q.includes("sipara")
  ) {
    return juzList.filter((j) =>
      j.id.toString().includes(juzNumber || "")
    );
  }

  return [];
};

// Use the existing quranApi axios instance — no fetch(), no undefined variable
export const fetchTafsirForVerse = async (verseKey, tafsirId = 169) => {
  const response = await quranApi.get(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
    params: { language: 'en' }
  });
  return response.data.tafsir; // { text, resource_name, language_name, ... }
};

export const fetchAvailableTafsirs = async () => {
  const response = await quranApi.get('/resources/tafsirs', {
    params: { language: 'en' }
  });
  return response.data.tafsirs; 
};
// Add this to src/api/quranApi.js

/**
 * Fetches the list of all available chapter reciters
 */
// --- AUDIO SECTION ---

/**
 * Fetches the list of reciters. 
 * Use this to populate your ReciterSelector component.
 */
export const fetchChapterReciters = async () => {
  try {
    const response = await quranApi.get('/resources/chapter_reciters', {
      params: { language: 'en' }
    });
    return response.data.reciters;
  } catch (error) {
    console.error("Error fetching reciters:", error);
    return [];
  }
};

/**
 * The most reliable endpoint for audio.
 * Fetches an array of audio files (one for every verse).
 * Works for both playing a single verse and streaming the whole surah.
 */
export const fetchVerseAudioList = async (reciterId = 7, chapterId) => {
  try {
    const response = await quranApi.get(`/recitations/${reciterId}/by_chapter/${chapterId}`);
    // The API returns { audio_files: [ { verse_key, url }, ... ] }
    return response.data.audio_files;
  } catch (error) {
    console.error("Audio API Error:", error);
    return []; // Return empty array so the app doesn't crash
  }
};

export default quranApi;