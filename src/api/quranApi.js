import axios from "axios";

const quranApi = axios.create({
  baseURL: "https://api.quran.com/api/v4",
  headers: {
    Accept: "application/json",
  },
});

const VERSE_AUDIO_CDN = "https://verses.quran.com/";

const normalizeAudioUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  return `${VERSE_AUDIO_CDN}${rawUrl.replace(/^\/+/, "")}`;
};

export const fetchChapters = async () => {
  const response = await quranApi.get("/chapters?language=en");
  return response.data.chapters;
};

export const fetchSurahVerses = async (chapterId, translationId = "85") => {
  const response = await quranApi.get(`/verses/by_chapter/${chapterId}`, {
    params: {
      language: "en",
      words: true,
      translations: translationId,
      fields: "text_uthmani,page_number,juz_number",
      per_page: 300,
    },
  });
  return response.data.verses;
};

export const fetchAvailableTranslations = async () => {
  const response = await quranApi.get("/resources/translations");
  return response.data.translations;
};

export const fetchChapterDetail = async (chapterId) => {
  const response = await quranApi.get(`/chapters/${chapterId}?language=en`);
  return response.data.chapter;
};

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
    params: { q: query, language: "en", size: 5 },
  });
  return response.data.search.results;
};

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
  } catch {
    return null;
  }
};

export const fetchVersesByPage = async (pageNumber, translationId = "85") => {
  const response = await quranApi.get(`/verses/by_page/${pageNumber}`, {
    params: {
      language: "en",
      translations: translationId,
      fields: "text_uthmani,verse_key,chapter_id,juz_number,page_number",
    },
  });
  return response.data.verses;
};

export const getPageImageUrl = (pageNumber) => {
  const paddedPage = String(pageNumber).padStart(3, "0");
  return `https://static.quran.com/images/pages/mushaf/v2/${paddedPage}.png`;
};

export const getChapterSuggestions = (chapters, query) => {
  if (!query || !Array.isArray(chapters)) return [];

  const q = query.toLowerCase().trim();
  const cleaned = q.replace("surah", "").replace("surat", "").trim();

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

  if (q.includes("juz") || q.includes("para") || q.includes("sipara")) {
    return juzList.filter((j) => j.id.toString().includes(juzNumber || ""));
  }

  return [];
};

export const fetchTafsirForVerse = async (verseKey, tafsirId = 169) => {
  const response = await quranApi.get(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
    params: { language: "en" },
  });
  return response.data.tafsir;
};

export const fetchAvailableTafsirs = async () => {
  const response = await quranApi.get("/resources/tafsirs", {
    params: { language: "en" },
  });
  return response.data.tafsirs;
};

export const fetchChapterReciters = async () => {
  try {
    const response = await quranApi.get("/resources/chapter_reciters", {
      params: { language: "en" },
    });
    return response.data.reciters || [];
  } catch (error) {
    console.error("Error fetching reciters:", error);
    return [];
  }
};

/**
 * Fetches verse-by-verse audio files for a chapter and recitation ID.
 * Returns normalized items with a playable `url` property.
 */
export const fetchVerseAudioList = async (recitationId = 7, chapterId) => {
  if (!chapterId) return [];

  try {
    const response = await quranApi.get(`/recitations/${recitationId}/by_chapter/${chapterId}`, {
      params: { per_page: 300 },
    });

    const files = response.data?.audio_files || [];
    return files
      .map((item) => {
        const resolvedUrl = normalizeAudioUrl(item.url || item.audio_url);
        return resolvedUrl ? { ...item, url: resolvedUrl } : null;
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Verse Audio API Error:", err?.response?.status || err.message);
    return [];
  }
};

/**
 * Fetches full-chapter audio URL for a chapter reciter ID.
 */
export const fetchFullChapterAudio = async (chapterReciterId = 7, chapterId) => {
  if (!chapterId) return null;

  try {
    const response = await quranApi.get(`/chapter_recitations/${chapterReciterId}/${chapterId}`);
    const audioFile = response.data?.audio_file || response.data?.audio_files?.[0];
    return normalizeAudioUrl(audioFile?.audio_url || audioFile?.url) || null;
  } catch (err) {
    console.error("Chapter Audio API Error:", err?.response?.status || err.message);
    return null;
  }
};

export default quranApi;