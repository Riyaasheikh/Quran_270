import { HADITH_DATABASE } from '../data/hadithData'; // <-- adjust path if your second snippet lives elsewhere

// Direct verse -> canonical Hadith number mappings for live fetching via fetchSingleHadith
// Direct verse -> canonical Hadith number mappings for live fetching via fetchSingleHadith.
// Keys match HADITH_EDITIONS IDs: "bukhari" | "muslim" | "tirmidhi" | "abudawud" | "nasai" | "ibnmajah"
export const VERSE_TO_HADITH_REFS = {
  '2:222': [
    {
      collection: 'muslim',
      hadithNumber: 223,
      contextNote: 'Purity in faith and daily worship alongside repentance.',
    },
  ],
  '2:255': [
    {
      collection: 'bukhari',
      hadithNumber: 5059,
      contextNote: 'Virtue and place of Ayat al-Kursi in the Book of Virtues of the Quran.',
    },
  ],
  '2:183': [
    {
      collection: 'bukhari',
      hadithNumber: 1894,
      contextNote: 'Fasting as a shield and guard against sin and heedlessness.',
    },
  ],
  '3:134': [
    {
      collection: 'bukhari',
      hadithNumber: 6116,
      contextNote: 'True strength lies in self-restraint when anger arises.',
    },
  ],
  '16:125': [
    {
      collection: 'muslim',
      hadithNumber: 2674,
      contextNote: 'Reward for calling others to guidance and righteousness.',
    },
  ],
  '17:23': [
    {
      collection: 'bukhari',
      hadithNumber: 5971,
      contextNote: 'Prioritizing kindness and companionship toward one’s mother and father.',
    },
  ],
  '29:64': [
    {
      collection: 'bukhari',
      hadithNumber: 6416,
      contextNote: 'Living in this world like a stranger or passing traveler.',
    },
  ],
  '96:1': [
    {
      collection: 'ibnmajah',
      hadithNumber: 224,
      contextNote: 'Seeking beneficial knowledge as a duty upon every Muslim.',
    },
  ],
  '96:19': [
    {
      collection: 'muslim',
      hadithNumber: 482,
      contextNote: 'Drawing closest to Allah in prostration (sujud) and making supplication.',
    },
  ],
  '112:1': [
    {
      collection: 'bukhari',
      hadithNumber: 5013,
      contextNote: 'Surah Al-Ikhlas declared equivalent to one-third of the Quran.',
    },
  ],
};

export function stripHtml(html = '') {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSunnahSearchUrl(query) {
  return `https://sunnah.com/search?q=${encodeURIComponent((query || '').trim())}`;
}

export function extractVerseSearchTerms(translationText = '', verseKey = '') {
  const plain = stripHtml(translationText);
  const stopWords = new Set([
    'that', 'this', 'with', 'from', 'they', 'them', 'their', 'have', 'has',
    'were', 'what', 'when', 'where', 'which', 'will', 'shall', 'your', 'ours',
    'into', 'onto', 'upon', 'over', 'under', 'then', 'than', 'and', 'the',
  ]);

  const keywords = plain
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));

  const uniqueKeywords = [...new Set(keywords)];

  return {
    plainText: plain,
    verseKeyQuery: verseKey ? `Quran ${verseKey}` : '',
    keywordQuery: uniqueKeywords.slice(0, 5).join(' ') || verseKey,
    keywords: uniqueKeywords,
  };
}

/**
 * Matches aspect-of-life Hadiths from HADITH_DATABASE against a verse's text & topic cues.
 */
export function findRelatedAspectHadiths(translationText = '', limit = 3) {
  if (!Array.isArray(HADITH_DATABASE) || HADITH_DATABASE.length === 0) {
    return [];
  }

  const { keywords } = extractVerseSearchTerms(translationText);
  if (keywords.length === 0) return [];

  const scored = HADITH_DATABASE.map((item) => {
    let score = 0;
    const itemKeywords = (item.keywords || []).map((k) => k.toLowerCase());
    const topic = (item.topic || '').toLowerCase();
    const englishLower = (item.english || '').toLowerCase();

    for (const kw of keywords) {
      if (topic.includes(kw) || kw.includes(topic)) score += 4;
      if (itemKeywords.some((ik) => ik.includes(kw) || kw.includes(ik))) score += 3;
      if (englishLower.includes(` ${kw} `)) score += 1;
    }

    return { item, score };
  });

  return scored
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}