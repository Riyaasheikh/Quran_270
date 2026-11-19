import React, { useEffect, useMemo, useState } from 'react';
import {
  RiCloseLine,
  RiExternalLinkLine,
  RiBookOpenLine,
  RiSearchLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiArrowRightUpLine,
} from '@remixicon/react';
import { fetchSingleHadith } from '../../api/hadithApi';
import {
  VERSE_TO_HADITH_REFS,
  buildSunnahSearchUrl,
  extractVerseSearchTerms,
  findRelatedAspectHadiths,
} from '../../utils/verseHadithMatcher';

const HadithDrawer = ({ verse, onClose, onOpenHadithDetail }) => {
  const [customQuery, setCustomQuery] = useState('');
  const [langTab, setLangTab] = useState('both'); // 'both' | 'english' | 'urdu'
  const [liveHadiths, setLiveHadiths] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState('');

  useEffect(() => {
    if (!verse) return;
    setCustomQuery('');
    setLiveError('');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [verse, onClose]);

  const rawTranslation =
    verse?.translations?.[0]?.text || verse?.translation?.text || '';

  const { plainText, verseKeyQuery, keywordQuery } = useMemo(
    () => extractVerseSearchTerms(rawTranslation, verse?.verse_key),
    [rawTranslation, verse?.verse_key]
  );

  const mappedRefs = useMemo(
    () => (verse?.verse_key ? VERSE_TO_HADITH_REFS[verse.verse_key] || [] : []),
    [verse?.verse_key]
  );

  const aspectMatches = useMemo(
    () => findRelatedAspectHadiths(rawTranslation, 3),
    [rawTranslation]
  );

  // Fetch live Arabic + English + Urdu narrations for mapped verses
  useEffect(() => {
    let active = true;
    if (!verse || mappedRefs.length === 0) {
      setLiveHadiths([]);
      setLoadingLive(false);
      return;
    }

    setLoadingLive(true);
    setLiveError('');

    Promise.allSettled(
      mappedRefs.map(async (ref) => {
        const data = await fetchSingleHadith(ref.collection, ref.hadithNumber);
        return { ...data, contextNote: ref.contextNote };
      })
    )
      .then((results) => {
        if (!active) return;
        const fulfilled = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value);

        setLiveHadiths(fulfilled);
        if (fulfilled.length === 0) {
          setLiveError('Could not load linked narrations right now.');
        }
      })
      .catch(() => {
        if (active) setLiveError('Unable to fetch Hadith text.');
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });

    return () => {
      active = false;
    };
  }, [verse, mappedRefs]);

  if (!verse) return null;

  const activeSearchTerm = customQuery.trim() || keywordQuery || verse.verse_key;
  const searchSubmitUrl = buildSunnahSearchUrl(activeSearchTerm);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    window.open(searchSubmitUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInspectHadith = (hadithObj) => {
    if (typeof onOpenHadithDetail === 'function') {
      onClose();
      onOpenHadithDetail(hadithObj);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[150]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Hadith references for verse ${verse.verse_key}`}
        className="fixed right-0 top-0 h-full w-full max-w-[560px] bg-white z-[160] shadow-2xl flex flex-col border-l border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ca4ab]/10 text-[#2ca4ab] flex items-center justify-center">
              <RiBookOpenLine size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Hadith References
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2ca4ab] mt-0.5">
                Verse {verse.verse_key}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Hadith drawer"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Verse Context & Translation Language Switch */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-gray-100 space-y-3">
          {verse.text_uthmani && (
            <p
              dir="rtl"
              lang="ar"
              className="text-2xl leading-loose text-right font-quran text-gray-900"
            >
              {verse.text_uthmani}
            </p>
          )}
          {plainText && (
            <p className="text-sm text-gray-600 leading-relaxed">{plainText}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Translation View
            </span>
            <div className="inline-flex rounded-lg bg-white border border-gray-200 p-0.5 text-xs">
              {[
                { id: 'both', label: 'EN + UR' },
                { id: 'english', label: 'English' },
                { id: 'urdu', label: 'Urdu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLangTab(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                    langTab === tab.id
                      ? 'bg-[#2ca4ab] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* 1. Live Linked Narrations */}
          {mappedRefs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <RiShieldCheckLine size={15} className="text-[#2ca4ab]" />
                  <span>Linked Canonical Narrations</span>
                </h3>
              </div>

              {loadingLive ? (
                <div className="p-6 rounded-2xl border border-gray-100 bg-[#f9fafb] flex items-center justify-center gap-2 text-xs text-gray-500">
                  <RiLoader4Line size={18} className="animate-spin text-[#2ca4ab]" />
                  <span>Loading Arabic, English &amp; Urdu text...</span>
                </div>
              ) : liveError ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/70 rounded-xl p-3">
                  {liveError}
                </p>
              ) : (
                liveHadiths.map((h) => (
                  <article
                    key={h.id}
                    className="p-4 rounded-2xl border border-gray-200/80 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2ca4ab]">
                        {h.reference}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {h.gradeLabel}
                      </span>
                    </div>

                    {h.contextNote && (
                      <p className="text-xs font-medium text-gray-500">
                        {h.contextNote}
                      </p>
                    )}

                    {h.arabic && (
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-lg leading-loose text-right font-quran text-gray-900 bg-[#f9fafb] p-3 rounded-xl"
                      >
                        {h.arabic}
                      </p>
                    )}

                    {(langTab === 'both' || langTab === 'english') && h.english && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {h.english}
                      </p>
                    )}

                    {(langTab === 'both' || langTab === 'urdu') && h.urdu && (
                      <p
                        dir="rtl"
                        lang="ur"
                        className="text-sm text-gray-700 leading-loose text-right"
                      >
                        {h.urdu}
                      </p>
                    )}

                    {typeof onOpenHadithDetail === 'function' && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleInspectHadith(h)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2ca4ab] hover:underline cursor-pointer"
                        >
                          <span>Open in full Hadith reader</span>
                          <RiArrowRightUpLine size={14} />
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </section>
          )}

          {/* 2. Aspect-of-Life Matches from HADITH_DATABASE */}
          {aspectMatches.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Related Life-Aspect Hadiths
              </h3>

              <div className="space-y-2.5">
                {aspectMatches.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-gray-200/80 bg-[#fcfdfd] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2ca4ab]">
                        {item.reference}
                      </span>
                      <span className="text-[11px] font-semibold capitalize px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {item.topic}
                      </span>
                    </div>

                    {item.narrator && (
                      <p className="text-[11px] font-medium text-gray-400">
                        {item.narrator}
                      </p>
                    )}

                    {(langTab === 'both' || langTab === 'english') && (
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {item.english}
                      </p>
                    )}

                    {(langTab === 'both' || langTab === 'urdu') && item.urdu && (
                      <p
                        dir="rtl"
                        lang="ur"
                        className="text-xs sm:text-sm text-gray-700 leading-loose text-right"
                      >
                        {item.urdu}
                      </p>
                    )}

                    {typeof onOpenHadithDetail === 'function' && (
                      <button
                        type="button"
                        onClick={() => handleInspectHadith(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2ca4ab] hover:underline cursor-pointer pt-0.5"
                      >
                        <span>Inspect &amp; bookmark</span>
                        <RiArrowRightUpLine size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Sunnah.com Keyword & Verse Lookup */}
          <section className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-200/70 space-y-3">
            <label
              htmlFor="drawer-sunnah-search"
              className="block text-xs font-bold uppercase tracking-wider text-gray-600"
            >
              Search Sunnah.com
            </label>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <RiSearchLine
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="drawer-sunnah-search"
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder={keywordQuery || `Verse ${verse.verse_key}`}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#2ca4ab]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#2ca4ab] hover:bg-[#258d93] text-white text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Search</span>
                <RiExternalLinkLine size={15} />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {keywordQuery && (
                <a
                  href={buildSunnahSearchUrl(keywordQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#2ca4ab] hover:text-[#2ca4ab] transition-colors"
                >
                  <span>Keywords: {keywordQuery}</span>
                  <RiExternalLinkLine size={13} />
                </a>
              )}
              {verseKeyQuery && (
                <a
                  href={buildSunnahSearchUrl(verseKeyQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#2ca4ab] hover:text-[#2ca4ab] transition-colors"
                >
                  <span>{verseKeyQuery}</span>
                  <RiExternalLinkLine size={13} />
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs text-gray-400">
          <span>Scholar grading shown where available</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
};

export default HadithDrawer;