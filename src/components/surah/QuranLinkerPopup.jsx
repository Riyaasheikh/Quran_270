import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  RiLinkM,
  RiArrowRightUpLine,
  RiArrowDownSLine,
  RiUserStarLine,
  RiGroupLine,
  RiBookOpenLine,
  RiAlertLine,
  RiInformationLine,
} from '@remixicon/react';
import api from '../../lib/axios';

const OPEN_KEY = 'linker-popup-open';
const DEBOUNCE_MS = 300;

// Per-verse results survive re-mounts (navigating between surahs) and scrolling back
const resultCache = new Map();

const humanize = (v) => (v ? String(v).replace(/_/g, ' ').toLowerCase() : '');

const readOpen = () => {
  try { return localStorage.getItem(OPEN_KEY) === '1'; } catch { return false; }
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                              */
/* ------------------------------------------------------------------ */

const CARD = 'bg-page-soft border border-border rounded-xl p-2.5';

function Section({ icon: Icon, title, count, children }) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
        <Icon size={13} className="text-accent" />
        {title}
        {count != null && <span className="text-subtle">· {count}</span>}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function JumpButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg
                 bg-accent-soft text-accent border border-accent/20 hover:bg-accent/20
                 transition-colors cursor-pointer text-start"
    >
      {children}
      <RiArrowRightUpLine size={12} className="shrink-0 rtl-flip" />
    </button>
  );
}

function Flag({ children }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-secondary bg-warning/10 border border-warning/30 rounded-lg p-2">
      <RiAlertLine size={13} className="text-warning shrink-0 mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

function MoreToggle({ open, onClick, warn }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-main transition-colors cursor-pointer"
    >
      {open ? 'Less' : 'Details'}
      {warn && !open && <RiAlertLine size={12} className="text-warning" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                              */
/* ------------------------------------------------------------------ */

function EntityCard({ item, kind, onJump }) {
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(item.note || item.flags);

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-sm font-bold text-main">{item.name}</span>
          {item.name_ar && <span className="font-arabic text-gold text-base ms-2">{item.name_ar}</span>}
        </div>
        <div className="shrink-0">
          <JumpButton onClick={() => onJump(item.jump)}>{item.passage}</JumpButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {item.group && <span className="theme-badge">{item.group}</span>}
        {item.thematic && <span className="theme-badge theme-badge-gold">Thematic</span>}
        {kind === 'figure' && item.type && (
          <span className="theme-badge theme-badge-accent capitalize">{humanize(item.type)}</span>
        )}
        {kind === 'figure' && item.identity_status && (
          <span className="theme-badge capitalize">{humanize(item.identity_status)}</span>
        )}
      </div>

      {item.match_note && (
        <p className="text-[11px] text-muted italic mt-1.5 leading-snug">{item.match_note}</p>
      )}

      {kind === 'figure' && item.linked_prophets && item.linked_prophets !== '-' && (
        <p className="text-[11px] text-muted mt-1.5">
          <span className="font-semibold text-secondary">Linked: </span>
          {item.linked_prophets}
        </p>
      )}

      {open && item.note && (
        <p className="text-[11px] text-secondary mt-1.5 leading-snug">{item.note}</p>
      )}
      {open && item.flags && <Flag>{item.flags}</Flag>}

      {hasMore && <MoreToggle open={open} onClick={() => setOpen((v) => !v)} warn={Boolean(item.flags)} />}
    </div>
  );
}

function StoryCard({ story, onJump }) {
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(story.connection || story.flag || story.tafsir_reference);

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-1.5">
        {story.segment_code && <span className="theme-badge theme-badge-accent">{story.segment_code}</span>}
        <span className="text-xs font-bold text-main">{story.segment_title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        <span className="theme-badge">{story.passage}</span>
        {story.relationship_type && (
          <span className="theme-badge capitalize">{humanize(story.relationship_type)}</span>
        )}
      </div>

      {story.summary && (
        <p className="text-[11px] text-secondary mt-1.5 leading-snug">{story.summary}</p>
      )}

      {open && story.connection && (
        <p className="text-[11px] text-muted mt-1.5 leading-snug">{story.connection}</p>
      )}
      {open && story.flag && <Flag>{story.flag}</Flag>}
      {open && story.tafsir_reference && (
        <p className="text-[10px] text-subtle mt-1.5 leading-snug">{story.tafsir_reference}</p>
      )}

      {hasMore && <MoreToggle open={open} onClick={() => setOpen((v) => !v)} warn={Boolean(story.flag)} />}

      {story.parallels?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Also told in</p>
          <div className="flex flex-wrap gap-1.5">
            {story.parallels.map((p) => (
              <JumpButton key={p.jump} onClick={() => onJump(p.jump)}>
                {p.surah_name} {p.passage}
              </JumpButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function XrefCard({ x, onJump }) {
  const [open, setOpen] = useState(false);
  const toStory = x.direction === 'to_story';
  const longNote = (x.note || '').length > 150;

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {toStory ? "Linked to Musa's story at" : 'Linked verse'}
        </span>
        {x.classification && <span className="theme-badge capitalize">{humanize(x.classification)}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {x.targets.map((t, i) =>
          t.jump ? (
            <JumpButton key={i} onClick={() => onJump(t.jump)}>{t.label}</JumpButton>
          ) : (
            <span key={i} className="theme-badge theme-badge-gold">{t.label}</span>
          )
        )}
      </div>

      {x.note && (
        <p className={`text-[11px] text-secondary mt-1.5 leading-snug ${open ? '' : 'line-clamp-3'}`}>
          {x.note}
        </p>
      )}
      {longNote && <MoreToggle open={open} onClick={() => setOpen((v) => !v)} />}
    </div>
  );
}

function ThemeGroups({ groups, onJump }) {
  return groups.map(([theme, items]) => (
    <div key={theme}>
      <p className="text-xs font-bold text-main mb-1.5">{theme}</p>
      <div className="space-y-2">
        {items.map((x, i) => (
          <XrefCard key={`${x.direction}-${x.passage}-${i}`} x={x} onJump={onJump} />
        ))}
      </div>
    </div>
  ));
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

export default function QuranLinkerPopup({ verseKey, onSelectVerse, raised = false, onOpenChange }) {
  const [activeKey, setActiveKey] = useState(verseKey);
  const [result, setResult] = useState(null); // { key, data }
  const [open, setOpen] = useState(readOpen);
  const [showBroad, setShowBroad] = useState(false);
  const bodyRef = useRef(null);

  const setOpenPersist = (value) => {
    setOpen(value);
    try { localStorage.setItem(OPEN_KEY, value ? '1' : '0'); } catch { /* ignore */ }
  };

  // Only react once the reader settles on a verse
  useEffect(() => {
    const t = setTimeout(() => setActiveKey(verseKey), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [verseKey]);

  // One request per verse: cached, abortable
  useEffect(() => {
    if (!activeKey) return;

    const cached = resultCache.get(activeKey);
    if (cached) {
      setResult({ key: activeKey, data: cached });
      return;
    }

    const ctrl = new AbortController();
    api
      .get('/api/quran/linker', { params: { verse_key: activeKey }, signal: ctrl.signal })
      .then((res) => {
        resultCache.set(activeKey, res.data);
        setResult({ key: activeKey, data: res.data });
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
        console.error('Linker API error:', err);
        setResult({ key: activeKey, data: null });
      });

    return () => ctrl.abort();
  }, [activeKey]);

  // Never show another verse's links while a new request is pending
  const data = result?.key === activeKey ? result.data : null;

  // New verse: back to the top, broad links hidden again
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setShowBroad(false);
  }, [activeKey]);

  // Escape minimizes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpenPersist(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const visible = Boolean(data && data.total > 0);

  // Tell the page whether the panel is showing, so it can leave room for it
  useEffect(() => {
    onOpenChange?.(open && visible);
  }, [open, visible, onOpenChange]);
  useEffect(() => () => onOpenChange?.(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  const cross = useMemo(() => {
    const specific = new Map();
    const broad = new Map();
    let broadCount = 0;

    for (const x of data?.cross_references ?? []) {
      const bucket = x.broad ? broad : specific;
      if (x.broad) broadCount += 1;
      if (!bucket.has(x.theme)) bucket.set(x.theme, []);
      bucket.get(x.theme).push(x);
    }

    return {
      specific: [...specific],
      broad: [...broad],
      broadCount,
    };
  }, [data]);

  if (!data || data.total === 0) return null;

  const jump = (key) => key && onSelectVerse(key);
  const bottom = `calc(${raised ? '10.5rem' : '6rem'} + env(safe-area-inset-bottom))`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpenPersist(true)}
        style={{ bottom }}
        className="fixed right-4 sm:right-6 z-40 theme-button !min-h-0 !py-3 !px-4 rounded-full shadow-2xl ring-4 ring-accent/25"
        aria-label={`Open ${data.total} linked references for verse ${activeKey}`}
        aria-expanded="false"
      >
        <RiLinkM size={18} />
        <span className="text-sm font-bold">Links · {data.total}</span>
      </button>
    );
  }

  return (
    <aside
      role="complementary"
      aria-label={`Linked references for verse ${activeKey}`}
      style={{ bottom }}
      className="fixed right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] max-w-sm bg-card/95 text-main
                 border border-border-strong rounded-2xl shadow-2xl backdrop-blur-xl
                 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
          <RiLinkM size={16} /> Verse {activeKey}
          <span className="theme-badge theme-badge-accent">{data.total}</span>
          {data.has_unverified && <span className="theme-badge theme-badge-gold">Unreviewed</span>}
        </span>
        <button
          type="button"
          onClick={() => setOpenPersist(false)}
          className="theme-icon-button theme-icon-button-sm"
          aria-label="Minimize linked references"
          aria-expanded="true"
        >
          <RiArrowDownSLine size={18} />
        </button>
      </div>

      <div ref={bodyRef} className="max-h-[55vh] overflow-y-auto px-4 py-3 space-y-4">
        {data.prophets.length > 0 && (
          <Section icon={RiUserStarLine} title="Prophets" count={data.prophets.length}>
            {data.prophets.map((p) => (
              <EntityCard key={`p-${p.id}`} item={p} kind="prophet" onJump={jump} />
            ))}
          </Section>
        )}

        {data.figures.length > 0 && (
          <Section icon={RiGroupLine} title="Figures & groups" count={data.figures.length}>
            {data.figures.map((f) => (
              <EntityCard key={`f-${f.id}`} item={f} kind="figure" onJump={jump} />
            ))}
          </Section>
        )}

        {data.story.length > 0 && (
          <Section icon={RiBookOpenLine} title="Story of Musa (AS)">
            {data.story.map((s, i) => (
              <StoryCard key={`${s.segment_code}-${s.passage}-${i}`} story={s} onJump={jump} />
            ))}
          </Section>
        )}

        {data.cross_references.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
              <RiLinkM size={13} className="text-accent" />
              Thematic links
              <span className="text-subtle">· {data.cross_references.length}</span>
            </h3>

            <div className="space-y-3">
              <ThemeGroups groups={cross.specific} onJump={jump} />

              {cross.broadCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowBroad((v) => !v)}
                    aria-expanded={showBroad}
                    className="w-full text-[11px] font-semibold text-accent hover:underline cursor-pointer text-start"
                  >
                    {showBroad
                      ? 'Hide broader links'
                      : `Show ${cross.broadCount} broader link${cross.broadCount > 1 ? 's' : ''} (tied to a long passage)`}
                  </button>
                  {showBroad && <ThemeGroups groups={cross.broad} onJump={jump} />}
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {data.has_unverified && (
        <p className="flex items-start gap-1.5 px-4 py-2 border-t border-border text-[10px] leading-snug text-muted">
          <RiInformationLine size={13} className="shrink-0 mt-px" />
          These links are candidates and have not been reviewed yet. Check them against the text and
          trusted tafsir before relying on them.
        </p>
      )}
    </aside>
  );
}