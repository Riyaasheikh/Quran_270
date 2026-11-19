/**
 * Zakat calculation helpers. Pure functions: no React, no network.
 * All money values are in the currency the user selected.
 */

// Standard rate (1/40th). The Quran's text commands zakat but does not state a rate;
// 2.5% comes from hadith and juristic tradition, so the calculator lets users change it.
export const DEFAULT_RATE_PERCENT = 2.5;

// Scholars and institutions use two common sets of weights:
//  - South Asian: 7.5 tola gold / 52.5 tola silver (1 tola = 11.6638 g)
//  - Classical:   20 mithqal gold / 200 dirham silver, commonly rounded to 85 g / 595 g
export const NISAB_WEIGHTS = {
  tola: { label: 'South Asian (tola)', gold: 87.48, silver: 612.36 },
  classical: { label: 'Classical', gold: 85, silver: 595 },
};

// Must stay in sync with MetalPriceService::CURRENCIES on the backend
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'PKR', 'INR', 'BDT', 'SAR',
  'AED', 'TRY', 'MYR', 'IDR', 'EGP', 'CAD', 'AUD',
];

export const EMPTY_VALUES = {
  cash: '',
  receivables: '',
  goldGrams: '',
  silverGrams: '',
  stocks: '',
  inventory: '',
  crypto: '',
  liabilities: '',
};

/** "1,250.50" -> 1250.5. Anything invalid or negative becomes 0. */
export function toNumber(value) {
  const n = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

export function currencySymbol(currency) {
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Price of one gram of a metal in `currency`, or null if the snapshot lacks it. */
export function pricePerGram(snapshot, currency, metal) {
  const usd = snapshot?.usd_per_gram?.[metal];
  const rate = snapshot?.rates?.[currency];
  return usd > 0 && rate > 0 ? usd * rate : null;
}

/** A typed percentage becomes a rate; blank, zero or above 100 falls back to the standard 2.5%. */
export function resolveRate(ratePercent) {
  const pct = toNumber(ratePercent);
  return (pct > 0 && pct <= 100 ? pct : DEFAULT_RATE_PERCENT) / 100;
}

/**
 * @param values       raw string inputs keyed like EMPTY_VALUES
 * @param prices       { gold, silver } price per gram in the selected currency (null if unknown)
 * @param basis        'silver' | 'gold' | 'custom'
 * @param weights      { gold, silver } nisab weights in grams
 * @param ratePercent  optional typed rate, e.g. '2.5'
 * @param customNisab  optional typed nisab amount, used when basis === 'custom'
 *
 * status: 'empty' | 'no_prices' | 'no_nisab' | 'below' | 'due'
 */
export function calculateZakat({ values, prices, basis, weights, ratePercent = '', customNisab = '' }) {
  const n = (key) => toNumber(values[key]);

  const goldGrams = n('goldGrams');
  const silverGrams = n('silverGrams');

  const nisabGold = prices.gold ? weights.gold * prices.gold : null;
  const nisabSilver = prices.silver ? weights.silver * prices.silver : null;
  const nisabCustom = toNumber(customNisab) || null;
  const nisab = basis === 'gold' ? nisabGold : basis === 'custom' ? nisabCustom : nisabSilver;
  const rate = resolveRate(ratePercent);

  const metalNeedsPrice =
    (goldGrams > 0 && !prices.gold) || (silverGrams > 0 && !prices.silver);

  const goldValue = prices.gold ? goldGrams * prices.gold : 0;
  const silverValue = prices.silver ? silverGrams * prices.silver : 0;

  const gross =
    n('cash') + n('receivables') + n('stocks') + n('inventory') + n('crypto') + goldValue + silverValue;
  const liabilities = n('liabilities');
  const net = Math.max(0, gross - liabilities);

  const entered = gross > 0 || liabilities > 0 || goldGrams > 0 || silverGrams > 0;

  let status;
  if (!entered) status = 'empty';
  else if (metalNeedsPrice) status = 'no_prices';
  else if (nisab === null) status = basis === 'custom' ? 'no_nisab' : 'no_prices';
  else if (net >= nisab) status = 'due';
  else status = 'below';

  const zakat = status === 'due' ? Math.round(net * rate * 100) / 100 : 0;
  const progress = nisab ? Math.min(1, net / nisab) : 0;

  return {
    goldValue,
    silverValue,
    gross,
    liabilities,
    net,
    nisab,
    nisabGold,
    nisabSilver,
    nisabCustom,
    rate,
    status,
    zakat,
    progress,
  };
}