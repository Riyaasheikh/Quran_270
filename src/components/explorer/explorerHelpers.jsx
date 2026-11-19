import React from 'react';
import {
  RiAlertLine,
  RiArrowRightUpLine,
  RiBook2Line,
} from '@remixicon/react';

// Splits on semicolons, commas, or newlines cleanly
export const parseList = (str) =>
  !str || str === '-'
    ? []
    : String(str)
        .split(/[;,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);

// Extracts Surah & starting Verse even if formatted as "20:9-98" or "Surah Ta-Ha 20:9"
export const parseAnchors = (str) =>
  parseList(str).map((raw) => {
    const match = raw.match(/(\d{1,3})\s*:\s*(\d{1,3})/);
    return {
      label: raw,
      surahId: match?.[1] ?? null,
      verseNum: match?.[2] ?? null,
    };
  });

export function AnchorChips({ anchors, onJump }) {
  if (!anchors?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {anchors.map((a, i) => (
        <button
          key={`${a.label}-${i}`}
          type="button"
          disabled={!a.surahId}
          onClick={() => onJump(a.surahId, a.verseNum)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-accent-soft theme-accent border border-accent/25 transition-all hover:border-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{a.label}</span>
          {a.surahId && <RiArrowRightUpLine size={12} />}
        </button>
      ))}
    </div>
  );
}

export function NoteBox({ label, children }) {
  return (
    <div className="bg-gold-soft border border-theme rounded-xl p-3 flex items-start gap-2.5">
      <RiAlertLine size={16} className="theme-gold shrink-0 mt-0.5" />
      <p className="text-[11px] theme-secondary leading-relaxed">
        <strong className="font-bold theme-gold">{label}: </strong>
        {children}
      </p>
    </div>
  );
}

export function EmptySearchState({ title, query, onClear }) {
  return (
    <div className="theme-card theme-card-static p-10 text-center">
      <RiBook2Line size={32} className="theme-muted mx-auto mb-3" />
      <h3 className="theme-text font-bold">{title}</h3>
      <p className="theme-muted text-sm mt-1">
        {query
          ? `No entries matched "${query}".`
          : 'No records available in this category yet.'}
      </p>
      {query && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="theme-button-outline mt-4 text-xs"
        >
          Clear search
        </button>
      )}
    </div>
  );
}