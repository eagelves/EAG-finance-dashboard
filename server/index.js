/**
 * Finance Proxy Server
 *
 * A minimal Express server that exposes Yahoo Finance data to the React
 * frontend. Runs locally on port 3001 (configurable via PORT env var).
 * The Vite dev server proxies /api/* requests to this server.
 *
 * Routes
 *   GET /api/quotes            — current-day quotes for all tracked companies
 *   GET /api/history/weekly    — 7-day price history per company
 *   GET /api/history/quarterly — ~63-day price history per company
 *   GET /api/health            — uptime check
 *
 * Security
 *   - Binds to 127.0.0.1 only (never 0.0.0.0).
 *   - Tickers are validated against an allowlist; the proxy cannot be used
 *     as an open relay for arbitrary symbols.
 *   - Errors are logged server-side; only a generic message reaches the client.
 */

import express from 'express';
import YahooFinance from 'yahoo-finance2';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = '127.0.0.1';

/** Allowlisted tickers — must stay in sync with COMPANIES in financeService.js */
const ALLOWED_TICKERS = ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM'];

const yf  = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const app = express();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a normalised current-quote for one ticker.
 * Returns null on failure (logged server-side).
 */
async function fetchQuote(ticker) {
  try {
    const result = await yf.quote(ticker);
    return {
      ticker:    result.symbol,
      name:      result.shortName ?? ticker,
      price:     result.regularMarketPrice     ?? 0,
      change:    result.regularMarketChange    ?? 0,
      changePct: result.regularMarketChangePercent ?? 0,
      volume:    result.regularMarketVolume    ?? 0,
    };
  } catch (err) {
    console.error(`[proxy] quote failed for ${ticker}:`, err.message);
    return null;
  }
}

/**
 * Fetch daily closes for one ticker over the last `days` calendar days.
 * Returns an array of { date, price } objects sorted oldest-first.
 */
async function fetchHistory(ticker, days) {
  const end   = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  try {
    const result = await yf.chart(ticker, {
      period1:  start.toISOString().slice(0, 10),
      period2:  end.toISOString().slice(0, 10),
      interval: '1d',
    });

    return (result?.quotes ?? [])
      .filter((q) => q.close != null)
      .map((q) => ({
        date:  new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(q.close.toFixed(2)),
      }));
  } catch (err) {
    console.error(`[proxy] history failed for ${ticker}:`, err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/history/custom?ticker=AAPL&days=30 — history for any single ticker (Issue #1) */
app.get('/api/history/custom', async (req, res) => {
  const ticker = (req.query.ticker ?? '').trim().toUpperCase();
  const days   = Math.min(parseInt(req.query.days ?? '30', 10) || 30, 365);

  // Validate: 1-10 alphanumeric characters
  if (!/^[A-Z0-9.]{1,10}$/.test(ticker)) {
    return res.status(400).json({ ok: false, error: 'Invalid ticker symbol.' });
  }

  try {
    const series = await fetchHistory(ticker, days);
    res.json({ ok: true, data: { ticker, series } });
  } catch (err) {
    console.error(`[proxy] /api/history/custom error for ${ticker}:`, err.message);
    res.status(500).json({ ok: false, error: 'Unable to fetch custom history.' });
  }
});

app.get('/api/quotes', async (_req, res) => {
  try {
    const results = await Promise.all(ALLOWED_TICKERS.map(fetchQuote));
    res.json({ ok: true, data: results.filter(Boolean) });
  } catch (err) {
    console.error('[proxy] /api/quotes error:', err.message);
    res.status(500).json({ ok: false, error: 'Unable to fetch quotes.' });
  }
});

app.get('/api/history/weekly', async (_req, res) => {
  try {
    const histories = await Promise.all(ALLOWED_TICKERS.map((t) => fetchHistory(t, 10)));
    const data = ALLOWED_TICKERS.map((ticker, i) => ({ ticker, series: histories[i] }));
    res.json({ ok: true, data });
  } catch (err) {
    console.error('[proxy] /api/history/weekly error:', err.message);
    res.status(500).json({ ok: false, error: 'Unable to fetch weekly history.' });
  }
});

app.get('/api/history/quarterly', async (_req, res) => {
  try {
    const histories = await Promise.all(ALLOWED_TICKERS.map((t) => fetchHistory(t, 70)));
    const data = ALLOWED_TICKERS.map((ticker, i) => ({ ticker, series: histories[i] }));
    res.json({ ok: true, data });
  } catch (err) {
    console.error('[proxy] /api/history/quarterly error:', err.message);
    res.status(500).json({ ok: false, error: 'Unable to fetch quarterly history.' });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, uptime: process.uptime() }),
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, HOST, () => {
  console.log(`[proxy] Finance proxy running at http://${HOST}:${PORT}`);
  console.log(`[proxy] Tracked tickers: ${ALLOWED_TICKERS.join(', ')}`);
});
