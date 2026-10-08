/**
 * Finance Data Service
 *
 * All data flows through the local Express proxy (/api/*).
 * If the proxy is unavailable the service falls back to deterministic
 * mock data so the UI and tests remain functional offline.
 *
 * Public API (shapes are identical for both real and mock paths):
 *
 *   fetchCurrentQuotes()   → Promise<QuoteSummary[]>
 *   fetchWeeklyHistory()   → Promise<CompanySeries[]>
 *   fetchQuarterlyHistory()→ Promise<CompanySeries[]>
 *   normaliseForComparison(CompanySeries[]) → FlatRow[]
 *
 * Types
 *   QuoteSummary  { ticker, name, price, change, changePct, volume }
 *   CompanySeries { ticker, name, color, series: [{date, price}] }
 *   FlatRow       { date, [ticker]: number }  (index-100 normalised)
 */

// ---------------------------------------------------------------------------
// Company registry — add / remove entries here to extend the app
// ---------------------------------------------------------------------------

export const COMPANIES = [
  { ticker: 'IBM',  name: 'IBM' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'ORCL', name: 'Oracle' },
  { ticker: 'SAP',  name: 'SAP' },
  { ticker: 'CRM',  name: 'Salesforce' },
];

export const COMPANY_COLORS = ['#0f62fe', '#107c41', '#c74634', '#0070f3', '#00a1e0'];

// ---------------------------------------------------------------------------
// Mock data helpers (used when the proxy is unavailable)
// ---------------------------------------------------------------------------

const BASE_PRICES = { IBM: 185, MSFT: 415, ORCL: 140, SAP: 195, CRM: 280 };

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 0xffffffff;
}

function generatePriceSeries(ticker, days) {
  const series = [];
  let price = BASE_PRICES[ticker] ?? 100;
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const delta = (seededRandom(`${ticker}-${label}`) - 0.49) * 0.04;
    price = parseFloat((price * (1 + delta)).toFixed(2));
    series.push({ date: label, price });
  }
  return series;
}

function buildMockQuotes() {
  return COMPANIES.map(({ ticker, name }) => {
    const series = generatePriceSeries(ticker, 2);
    const prev = series[0].price;
    const curr = series[1].price;
    const change = parseFloat((curr - prev).toFixed(2));
    const changePct = parseFloat(((change / prev) * 100).toFixed(2));
    const volume = Math.round(seededRandom(`${ticker}-vol`) * 9_000_000 + 1_000_000);
    return { ticker, name, price: curr, change, changePct, volume };
  });
}

function buildMockHistory(days) {
  return COMPANIES.map(({ ticker, name }, idx) => ({
    ticker,
    name,
    color: COMPANY_COLORS[idx],
    series: generatePriceSeries(ticker, days),
  }));
}

// ---------------------------------------------------------------------------
// API fetch helpers
// ---------------------------------------------------------------------------

async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${path}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? 'API error');
  return json.data;
}

/**
 * Merge colour and name metadata (from COMPANIES) into the raw proxy response
 * so every CompanySeries has the full shape the UI expects.
 */
function enrichSeries(rawArray) {
  return rawArray.map((item) => {
    const meta = COMPANIES.find((c) => c.ticker === item.ticker);
    const idx  = COMPANIES.findIndex((c) => c.ticker === item.ticker);
    return {
      ticker: item.ticker,
      name:   meta?.name ?? item.ticker,
      color:  COMPANY_COLORS[idx] ?? '#888',
      series: item.series ?? [],
    };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns current-day quote summaries for all tracked companies.
 * Falls back to mock data if the proxy is unreachable.
 */
export async function fetchCurrentQuotes() {
  try {
    return await apiFetch('/api/quotes');
  } catch {
    console.warn('[financeService] proxy unavailable — using mock quotes');
    return buildMockQuotes();
  }
}

/**
 * Returns 7-day price history for all tracked companies.
 * Falls back to mock data if the proxy is unreachable.
 */
export async function fetchWeeklyHistory() {
  try {
    const raw = await apiFetch('/api/history/weekly');
    return enrichSeries(raw);
  } catch {
    console.warn('[financeService] proxy unavailable — using mock weekly history');
    return buildMockHistory(7);
  }
}

/**
 * Returns ~63-day (one quarter) price history for all tracked companies.
 * Falls back to mock data if the proxy is unreachable.
 */
export async function fetchQuarterlyHistory() {
  try {
    const raw = await apiFetch('/api/history/quarterly');
    return enrichSeries(raw);
  } catch {
    console.warn('[financeService] proxy unavailable — using mock quarterly history');
    return buildMockHistory(63);
  }
}

/**
 * Normalises a multi-company series so all lines start at index 100.
 * Useful for percentage-based comparison charts.
 *
 * @param {CompanySeries[]} companySeriesArray
 * @returns {FlatRow[]}
 */
export function normaliseForComparison(companySeriesArray) {
  if (!companySeriesArray.length) return [];
  const dateMap = new Map();
  companySeriesArray.forEach(({ ticker, series }) => {
    const base = series[0]?.price ?? 1;
    series.forEach(({ date, price }) => {
      if (!dateMap.has(date)) dateMap.set(date, { date });
      dateMap.get(date)[ticker] = parseFloat(((price / base) * 100).toFixed(2));
    });
  });
  return Array.from(dateMap.values());
}
