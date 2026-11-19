import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiCoinsLine,
  RiCalculatorLine,
  RiRestartLine,
  RiLoader4Line,
  RiInformationLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiArrowDownSLine,
  RiArrowRightUpLine,
  RiBookOpenLine,
} from '@remixicon/react';
import Navbar from '../components/global/Navbar';
import Footer from '../components/global/Footer';
import api from '../lib/axios';
import { fetchSurahVerses } from '../api/quranApi';
import {
  CURRENCIES,
  DEFAULT_RATE_PERCENT,
  EMPTY_VALUES,
  NISAB_WEIGHTS,
  calculateZakat,
  currencySymbol,
  formatMoney,
  pricePerGram,
  toNumber,
} from '../lib/zakat';

/* ------------------------------------------------------------------ */
/* Static content                                                     */
/* ------------------------------------------------------------------ */

const RECIPIENTS = [
  { name: 'Al-Fuqara (The Poor)', text: 'People whose means fall short of their basic needs.' },
  { name: 'Al-Masakin (The Needy)', text: 'People in need whose income does not cover what their household requires.' },
  { name: 'Al-Amilina Alayha (Zakat Administrators)', text: 'Those appointed to collect, record and distribute zakat.' },
  { name: "Al-Mu'allafati Qulubuhum (Hearts Reconciled)", text: 'Those whose hearts are to be won over or strengthened, such as new Muslims who need support.' },
  { name: 'Fir-Riqab (Freeing Those in Bondage)', text: 'Freeing slaves and captives. Scholars discuss how this category applies today.' },
  { name: 'Al-Gharimin (The Indebted)', text: 'People weighed down by debt they cannot repay, where the debt was not taken on for sinful purposes.' },
  { name: 'Fi Sabilillah (In the Cause of Allah)', text: 'Scholars differ on its scope. Consult a qualified scholar before giving under this category.' },
  { name: 'Ibn as-Sabil (The Stranded Traveller)', text: 'A traveller cut off from their means who cannot complete their journey.' },
];

// Verses are linked into the in-app reader; no verse text is stored here.
const QURAN_REFERENCES = [
  { surah: 2, ayah: 43, label: '2:43', text: 'Zakat is commanded together with prayer. The same pairing recurs throughout the Quran (for example 2:110).' },
  { surah: 2, ayah: 177, label: '2:177', text: 'Giving wealth to relatives, orphans, the needy, travellers, those who ask, and for freeing captives is listed as part of righteousness, alongside paying zakat.' },
  { surah: 2, ayah: 219, label: '2:219', text: "Asked what to spend, the answer given is al-'afw: what can be spared." },
  { surah: 2, ayah: 267, label: '2:267', text: 'Spend from the good part of what you earn and of what the earth yields, and do not give what you would not accept yourself.' },
  { surah: 6, ayah: 141, label: '6:141', text: 'Give the due of a crop on the day it is harvested.' },
  { surah: 9, ayah: 34, label: '9:34-35', text: 'A warning against hoarding gold and silver without spending it in the way of Allah.' },
  { surah: 9, ayah: 60, label: '9:60', text: 'The eight categories of recipients.' },
  { surah: 9, ayah: 103, label: '9:103', text: 'Take charity from their wealth to purify them and cause them to grow.' },
  { surah: 51, ayah: 19, label: '51:19', text: 'In the wealth of the righteous there is a right for the one who asks and the one who is deprived (also 70:24-25).' },
];

/* ------------------------------------------------------------------ */
/* Data hooks                                                         */
/* ------------------------------------------------------------------ */

/** Gold/silver per-gram prices + FX rates from our own backend (which caches the providers). */
function useZakatPrices() {
  const [state, setState] = useState({ status: 'loading', data: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    api
      .get('/api/zakat/prices')
      .then((res) => setState({ status: 'ready', data: res.data }))
      .catch((err) => {
        console.error('Zakat prices unavailable:', err);
        setState({ status: 'error', data: null });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/** Surah At-Tawbah 9:60, taken from the app's own Quran API so no Quranic text is hard-coded. */
function useVerse960() {
  const [text, setText] = useState(null);

  useEffect(() => {
    let alive = true;

    fetchSurahVerses('9', '85')
      .then((verses) => {
        const verse = (verses || []).find((v) => v.verse_key === '9:60');
        const arabic = verse?.text_uthmani || verse?.text_imlaei || verse?.text_indopak || null;
        if (!arabic) console.warn('Zakat: Arabic text for 9:60 not found on verse object', verse);
        if (alive) setText(arabic);
      })
      .catch((err) => console.error('Zakat: could not load 9:60', err));

    return () => { alive = false; };
  }, []);

  return text;
}

/* ------------------------------------------------------------------ */
/* UI pieces                                                          */
/* ------------------------------------------------------------------ */

function AmountField({ id, label, hint, symbol, value, onChange, placeholder, tone = 'default' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label
          htmlFor={id}
          className={`text-sm font-semibold ${tone === 'danger' ? 'text-danger' : 'text-main'}`}
        >
          {label}
        </label>
        <span className="text-xs text-muted text-end">{hint ?? symbol}</span>
      </div>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        maxLength={16}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        className={`theme-input ${tone === 'danger' ? 'border-danger/40' : ''}`}
      />
    </div>
  );
}

function SummaryRow({ label, value, tone }) {
  const toneClass =
    tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-main';
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className={`text-sm ${tone === 'danger' ? 'text-danger' : 'text-secondary'}`}>{label}</span>
      <span className={`font-mono text-sm font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function StatusBox({ result, nisabLabel }) {
  const base = 'rounded-2xl border p-4 flex items-start gap-3';

  if (result.status === 'no_prices' || result.status === 'no_nisab') {
    const message =
      result.status === 'no_nisab' ? (
        <>Enter a nisab amount under <strong>Rules, prices &amp; settings</strong>.</>
      ) : (
        <>
          Live prices could not be loaded. Open <strong>Rules, prices &amp; settings</strong> and enter
          the current price per gram.
        </>
      );

    return (
      <div className={`${base} bg-warning/10 border-warning/30`}>
        <RiErrorWarningLine size={22} className="text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-main">
            {result.status === 'no_nisab' ? 'Nisab amount needed' : 'Metal prices needed'}
          </p>
          <p className="text-sm text-secondary mt-0.5">{message}</p>
        </div>
      </div>
    );
  }

  if (result.status === 'due') {
    return (
      <div className={`${base} bg-accent-soft border-accent/30`}>
        <RiCheckboxCircleLine size={22} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-main">Nisab reached</p>
          <p className="text-sm text-secondary mt-0.5">
            Your net wealth is above the {nisabLabel} nisab. Under the standard method, zakat is due on
            wealth held for a full lunar year (hawl).
          </p>
        </div>
      </div>
    );
  }

  if (result.status === 'below') {
    return (
      <div className={`${base} bg-page-soft border-border`}>
        <RiInformationLine size={22} className="text-muted shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-main">Below nisab threshold</p>
          <p className="text-sm text-secondary mt-0.5">
            Your net wealth is below the {nisabLabel} nisab, so zakat is not due on it under the
            standard method. Voluntary charity (sadaqah) is always rewarded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} bg-page-soft border-border`}>
      <RiInformationLine size={22} className="text-muted shrink-0 mt-0.5" />
      <p className="text-sm text-secondary">
        Enter your assets on the left. Everything is calculated in your browser; nothing you type is
        sent or stored.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function ZakatCalculator() {
  const [currency, setCurrency] = useState('USD');
  const [basis, setBasis] = useState('silver'); // 'silver' | 'gold' | 'custom'
  const [weightsKey, setWeightsKey] = useState('tola');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [ratePercent, setRatePercent] = useState('');
  const [customNisab, setCustomNisab] = useState('');
  const [customPrices, setCustomPrices] = useState({ gold: '', silver: '' });
  const [showSettings, setShowSettings] = useState(false);

  const { status: priceStatus, data: snapshot, reload } = useZakatPrices();
  const verseText = useVerse960();

  const symbol = useMemo(() => currencySymbol(currency), [currency]);
  const weights = NISAB_WEIGHTS[weightsKey];

  // Live price per gram in the selected currency, unless the user typed their own
  const prices = useMemo(() => {
    const live = {
      gold: pricePerGram(snapshot, currency, 'gold'),
      silver: pricePerGram(snapshot, currency, 'silver'),
    };
    return {
      gold: toNumber(customPrices.gold) || live.gold,
      silver: toNumber(customPrices.silver) || live.silver,
      customGold: toNumber(customPrices.gold) > 0,
      customSilver: toNumber(customPrices.silver) > 0,
    };
  }, [snapshot, currency, customPrices]);

  const result = useMemo(
    () => calculateZakat({ values, prices, basis, weights, ratePercent, customNisab }),
    [values, prices, basis, weights, ratePercent, customNisab]
  );

  const setValue = (key) => (v) => setValues((prev) => ({ ...prev, [key]: v }));

  const changeCurrency = (code) => {
    setCurrency(code);
    // These were typed in the previous currency
    setCustomPrices({ gold: '', silver: '' });
    setCustomNisab('');
  };

  const chooseBasis = (id) => {
    setBasis(id);
    if (id === 'custom') setShowSettings(true);
  };

  const money = (n) => formatMoney(n, currency);
  const perGram = (p) => (p ? `~${formatMoney(p, currency)}/g` : '');
  const nisabLabel = basis === 'custom' ? 'custom' : basis;

  const ratePct = Number((result.rate * 100).toFixed(4));
  const isStandardRate = result.rate === DEFAULT_RATE_PERCENT / 100;

  const asOf = snapshot?.metals_updated_at ? new Date(snapshot.metals_updated_at) : null;
  const asOfText = asOf && !Number.isNaN(asOf.getTime()) ? asOf.toLocaleString() : null;

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
          {/* ---------------- Hero ---------------- */}
          <section className="theme-card theme-card-static bg-linear-to-br from-accent-soft via-card to-gold-soft p-6 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                <RiCoinsLine size={18} /> The third pillar of Islam (purification of wealth)
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="zakat-currency" className="text-sm text-muted">Currency:</label>
                <select
                  id="zakat-currency"
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="theme-input !w-auto !min-h-0 !py-2 font-semibold cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c} ({currencySymbol(c)})</option>
                  ))}
                </select>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-main mt-4 text-balance">
              Zakat Calculator &amp; Nisab Guide
            </h1>
            <p className="text-secondary mt-3 max-w-3xl text-pretty">
              The Quran commands zakat and names who receives it. The usual calculation (2.5% of wealth
              above the nisab, held for a lunar year) comes from hadith and juristic tradition, and
              every one of those values can be changed below.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">Nisab standard:</span>

              <div className="flex flex-wrap p-1 rounded-2xl border border-border bg-card" role="group" aria-label="Nisab standard">
                {[
                  { id: 'silver', label: `Silver (${weights.silver}g)`, value: result.nisabSilver },
                  { id: 'gold', label: `Gold (${weights.gold}g)`, value: result.nisabGold },
                  { id: 'custom', label: 'Custom', value: result.nisabCustom },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={basis === opt.id}
                    onClick={() => chooseBasis(opt.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      basis === opt.id ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                  >
                    {opt.label}
                    {opt.value ? ` · ${money(opt.value)}` : ''}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted mt-3 max-w-3xl">
              Scholars differ on which standard to use. Silver gives a lower threshold, so zakat is due
              more widely; gold gives a higher one. Choose Custom to enter your own nisab amount.
            </p>
          </section>

          {/* ---------------- Calculator ---------------- */}
          <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr] items-start">
            {/* Inputs */}
            <div className="theme-card theme-card-static p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-border">
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-main">
                  <RiCalculatorLine size={22} className="text-gold" />
                  Zakatable assets
                </h2>
                <button
                  type="button"
                  onClick={() => setValues(EMPTY_VALUES)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-main transition-colors cursor-pointer shrink-0"
                >
                  <RiRestartLine size={16} /> Reset
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <AmountField
                    id="zk-cash"
                    label="Cash in hand & bank accounts"
                    symbol={symbol}
                    value={values.cash}
                    onChange={setValue('cash')}
                    placeholder="e.g. 5000"
                  />
                  <AmountField
                    id="zk-receivables"
                    label="Money owed to you"
                    hint="Loans you expect back"
                    value={values.receivables}
                    onChange={setValue('receivables')}
                    placeholder="e.g. 2000"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <AmountField
                    id="zk-gold"
                    label="Gold owned (grams)"
                    hint={perGram(prices.gold)}
                    value={values.goldGrams}
                    onChange={setValue('goldGrams')}
                    placeholder="e.g. 85"
                  />
                  <AmountField
                    id="zk-silver"
                    label="Silver owned (grams)"
                    hint={perGram(prices.silver)}
                    value={values.silverGrams}
                    onChange={setValue('silverGrams')}
                    placeholder="e.g. 600"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <AmountField
                    id="zk-stocks"
                    label="Tradable stocks & investments"
                    symbol={symbol}
                    value={values.stocks}
                    onChange={setValue('stocks')}
                    placeholder="e.g. 10000"
                  />
                  <AmountField
                    id="zk-inventory"
                    label="Business merchandise inventory"
                    symbol={symbol}
                    value={values.inventory}
                    onChange={setValue('inventory')}
                    placeholder="e.g. 3000"
                  />
                </div>

                <AmountField
                  id="zk-crypto"
                  label="Cryptocurrency & liquid digital assets"
                  symbol={symbol}
                  value={values.crypto}
                  onChange={setValue('crypto')}
                  placeholder="e.g. 2000"
                />

                <div className="pt-5 border-t border-border">
                  <AmountField
                    id="zk-liabilities"
                    label="Immediate liabilities & short-term debts due (deductions)"
                    hint="Rent, unpaid bills, instalments due now"
                    tone="danger"
                    value={values.liabilities}
                    onChange={setValue('liabilities')}
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              {/* Rules, prices & settings */}
              <div className="mt-6 pt-5 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowSettings((v) => !v)}
                  aria-expanded={showSettings}
                  className="w-full flex items-center justify-between text-sm font-semibold text-main cursor-pointer"
                >
                  <span>Rules, prices &amp; settings</span>
                  <RiArrowDownSLine
                    size={20}
                    className={`text-muted transition-transform ${showSettings ? 'rotate-180' : ''}`}
                  />
                </button>

                {showSettings && (
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Rules</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <AmountField
                          id="zk-rate"
                          label="Zakat rate (%)"
                          hint={`Standard: ${DEFAULT_RATE_PERCENT}`}
                          value={ratePercent}
                          onChange={setRatePercent}
                          placeholder={String(DEFAULT_RATE_PERCENT)}
                        />
                        <AmountField
                          id="zk-custom-nisab"
                          label="Custom nisab amount"
                          hint={basis === 'custom' ? symbol : 'Select "Custom" above'}
                          value={customNisab}
                          onChange={setCustomNisab}
                          placeholder="Your own threshold"
                        />
                      </div>
                      <p className="text-xs text-muted mt-2">
                        The 2.5% rate, the nisab weights and the one-year hawl are not stated in the text
                        of the Quran. They come from hadith and juristic tradition. Change them only if
                        you follow a different method; leave the rate blank for the standard.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Metal prices</p>
                      <p className="text-xs text-muted flex items-center gap-2 flex-wrap mb-3">
                        {priceStatus === 'loading' && (
                          <>
                            <RiLoader4Line size={14} className="animate-spin" /> Loading live prices...
                          </>
                        )}
                        {priceStatus === 'ready' && (
                          <>
                            Live spot prices{asOfText ? `, updated ${asOfText}` : ''}.
                            {snapshot?.stale && (
                              <span className="text-warning font-semibold"> Showing last saved prices.</span>
                            )}
                          </>
                        )}
                        {priceStatus === 'error' && (
                          <>
                            <span className="text-warning font-semibold">Live prices unavailable.</span>
                            <button type="button" onClick={reload} className="text-accent hover:underline cursor-pointer">
                              Retry
                            </button>
                          </>
                        )}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <AmountField
                          id="zk-price-gold"
                          label="Gold price per gram"
                          hint={prices.customGold ? 'Your price' : symbol}
                          value={customPrices.gold}
                          onChange={(v) => setCustomPrices((p) => ({ ...p, gold: v }))}
                          placeholder={prices.gold ? prices.gold.toFixed(2) : 'Enter price'}
                        />
                        <AmountField
                          id="zk-price-silver"
                          label="Silver price per gram"
                          hint={prices.customSilver ? 'Your price' : symbol}
                          value={customPrices.silver}
                          onChange={(v) => setCustomPrices((p) => ({ ...p, silver: v }))}
                          placeholder={prices.silver ? prices.silver.toFixed(2) : 'Enter price'}
                        />
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Live prices are international spot prices. Local jewellers often charge a
                        different rate, so enter yours here if you want it used.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="zk-weights" className="block text-sm font-semibold text-main mb-1.5">
                        Nisab weights (silver and gold standards)
                      </label>
                      <select
                        id="zk-weights"
                        value={weightsKey}
                        onChange={(e) => setWeightsKey(e.target.value)}
                        className="theme-input cursor-pointer"
                      >
                        {Object.entries(NISAB_WEIGHTS).map(([key, w]) => (
                          <option key={key} value={key}>
                            {w.label}: {w.gold}g gold / {w.silver}g silver
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted mt-1.5">
                        Both are in common use. The South Asian figures come from 7.5 and 52.5 tola.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <aside className="theme-card theme-card-static p-6 md:p-8 lg:sticky lg:top-28" aria-live="polite">
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">Calculation summary</h2>
                <span className="font-mono text-xs font-bold text-gold">
                  Rate: {ratePct}%{isStandardRate ? ' (1/40th)' : ''}
                </span>
              </div>

              <SummaryRow label="Gross zakatable assets:" value={money(result.gross)} />
              <SummaryRow label="Less liabilities:" value={`-${money(result.liabilities)}`} tone="danger" />
              <div className="border-t border-border mt-1 pt-1">
                <SummaryRow label="Net zakatable wealth:" value={money(result.net)} tone="success" />
              </div>
              <SummaryRow
                label={`Active nisab (${nisabLabel}):`}
                value={result.nisab ? money(result.nisab) : '-'}
              />

              {result.nisab && result.status !== 'empty' && (
                <div className="mt-3" aria-hidden="true">
                  <div className="h-2 rounded-full bg-page-soft border border-border overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${Math.round(result.progress * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted mt-1">
                    {Math.round(result.progress * 100)}% of the nisab
                  </p>
                </div>
              )}

              <div className="mt-5">
                <StatusBox result={result} nisabLabel={nisabLabel} />
              </div>

              <div className="mt-5 rounded-2xl border border-gold/40 bg-gold-soft p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-gold">Total zakat payable</p>
                <p className="font-mono text-4xl md:text-5xl font-extrabold text-main mt-2 break-all">
                  {money(result.zakat)}
                </p>
                <p className="text-xs text-muted mt-2">Purification for {currency} currency</p>
              </div>
            </aside>
          </section>

          {/* ---------------- What the Quran specifies ---------------- */}
          <section className="theme-card theme-card-static p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-main">
              What the Quran specifies, and what it leaves to other sources
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-accent/30 bg-accent-soft p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent">In the text of the Quran</h3>
                <ul className="mt-3 space-y-2 text-sm text-secondary list-disc ps-5">
                  <li>Zakat is an obligation, commanded alongside prayer.</li>
                  <li>Its purpose is purification of wealth and the giver.</li>
                  <li>Who receives it: the eight categories in 9:60.</li>
                  <li>Give from what is good in your earnings and from what can be spared.</li>
                  <li>Crops carry a due on the day of harvest.</li>
                  <li>Gold and silver must not be hoarded without spending in Allah&apos;s way.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gold/40 bg-gold-soft p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Not given in the Quran&apos;s text</h3>
                <ul className="mt-3 space-y-2 text-sm text-secondary list-disc ps-5">
                  <li>A fixed rate such as 2.5%.</li>
                  <li>A nisab in grams or in money.</li>
                  <li>A one-year holding period (hawl).</li>
                  <li>A complete list of zakatable asset types.</li>
                </ul>
                <p className="text-xs text-muted mt-3">
                  The standard calculator uses values for these taken from hadith and juristic
                  tradition. If you follow a different method, set your own rate and nisab in
                  Rules, prices &amp; settings.
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mt-6 mb-3">Read the verses</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QURAN_REFERENCES.map((r) => (
                <Link
                  key={r.label}
                  to={`/surah/${r.surah}/${r.ayah}`}
                  className="group rounded-2xl border border-border bg-page-soft p-4 hover:border-accent transition-colors"
                >
                  <span className="flex items-center justify-between text-sm font-bold text-accent">
                    {r.label}
                    <RiArrowRightUpLine size={16} className="text-muted group-hover:text-accent" />
                  </span>
                  <span className="block text-sm text-secondary mt-1.5 leading-relaxed">{r.text}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ---------------- Recipients ---------------- */}
          <section className="theme-card theme-card-static p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Surah At-Tawbah (9:60)</p>
            <h2 className="text-xl md:text-2xl font-extrabold text-main mt-1">
              The eight recipients of zakat (as-sadaqat)
            </h2>

            <div className="mt-4 pb-5 border-b border-border">
              {verseText ? (
                <p dir="rtl" lang="ar" className="font-quran quran-text-sm text-accent">
                  {verseText}
                </p>
              ) : null}

              <Link
                to="/surah/9/60"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-accent hover:underline"
              >
                <RiBookOpenLine size={16} /> Read 9:60 with translation in the reader
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RECIPIENTS.map((r, i) => (
                <div key={r.name} className="rounded-2xl border border-border bg-page-soft p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold-soft text-gold text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-bold text-main leading-snug">{r.name}</h3>
                  </div>
                  <p className="text-sm text-secondary mt-2.5 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted mt-4">
              Scholars differ on exactly how the poor (fuqara) and the needy (masakin) are
              distinguished, and on the modern scope of several categories.
            </p>
          </section>

          {/* ---------------- Notes ---------------- */}
          <section className="theme-card theme-card-static p-6 md:p-8">
            <h2 className="text-lg font-bold text-main mb-3">Before you rely on this number</h2>
            <ul className="space-y-2 text-sm text-secondary list-disc ps-5">
              <li>This is an estimate from the figures you enter, not a ruling. For your own situation, ask someone qualified whom you trust.</li>
              <li>Opinions differ on jewellery worn regularly, which debts may be deducted, and shares held as long-term investments.</li>
              <li>Not included: livestock, crops, and buried treasure. Their rules differ from the rules for money and trade goods.</li>
              <li>Cryptocurrency is treated here as wealth, which is the common contemporary view, but opinions vary.</li>
              <li>Under the standard method, zakat is due only on wealth held at or above the nisab for a full lunar year.</li>
            </ul>
          </section>

          <p className="text-[11px] text-subtle text-center">
            Metal prices from{' '}
            <a href="https://gold-api.com" className="underline" target="_blank" rel="noreferrer">gold-api.com</a>.{' '}
            <a href="https://www.exchangerate-api.com" className="underline" target="_blank" rel="noreferrer">
              Rates By Exchange Rate API
            </a>.
          </p>
        </main>
      </div>

      <Footer />
    </div>
  );
}