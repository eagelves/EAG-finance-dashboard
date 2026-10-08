import { describe, it, expect } from 'vitest';
import {
  COMPANIES,
  fetchCurrentQuotes,
  fetchWeeklyHistory,
  fetchQuarterlyHistory,
  normaliseForComparison,
} from '../services/financeService.js';

describe('financeService', () => {
  describe('COMPANIES', () => {
    it('contains at least one entry', () => {
      expect(COMPANIES.length).toBeGreaterThan(0);
    });

    it('every entry has a ticker and a name', () => {
      COMPANIES.forEach(({ ticker, name }) => {
        expect(typeof ticker).toBe('string');
        expect(ticker.length).toBeGreaterThan(0);
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('fetchCurrentQuotes', () => {
    it('returns one quote per company', async () => {
      const quotes = await fetchCurrentQuotes();
      expect(quotes.length).toBe(COMPANIES.length);
    });

    it('each quote has required numeric fields', async () => {
      const quotes = await fetchCurrentQuotes();
      quotes.forEach((q) => {
        expect(typeof q.price).toBe('number');
        expect(typeof q.change).toBe('number');
        expect(typeof q.changePct).toBe('number');
        expect(typeof q.volume).toBe('number');
        expect(q.price).toBeGreaterThan(0);
        expect(q.volume).toBeGreaterThan(0);
      });
    });

    it('is deterministic across calls', async () => {
      const first  = await fetchCurrentQuotes();
      const second = await fetchCurrentQuotes();
      first.forEach((q, i) => {
        expect(q.price).toBe(second[i].price);
      });
    });
  });

  describe('fetchWeeklyHistory', () => {
    it('returns 7 data points per company', async () => {
      const history = await fetchWeeklyHistory();
      history.forEach(({ series }) => {
        expect(series.length).toBe(7);
      });
    });

    it('each series entry has date and price', async () => {
      const history = await fetchWeeklyHistory();
      history[0].series.forEach(({ date, price }) => {
        expect(typeof date).toBe('string');
        expect(typeof price).toBe('number');
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  describe('fetchQuarterlyHistory', () => {
    it('returns 63 data points per company', async () => {
      const history = await fetchQuarterlyHistory();
      history.forEach(({ series }) => {
        expect(series.length).toBe(63);
      });
    });
  });

  describe('normaliseForComparison', () => {
    it('returns an empty array for empty input', () => {
      expect(normaliseForComparison([])).toEqual([]);
    });

    it('first row index value is 100 for each company', async () => {
      const history = await fetchWeeklyHistory();
      const rows = normaliseForComparison(history);
      history.forEach(({ ticker }) => {
        expect(rows[0][ticker]).toBe(100);
      });
    });

    it('output rows match the number of unique dates', async () => {
      const history = await fetchWeeklyHistory();
      const rows = normaliseForComparison(history);
      expect(rows.length).toBe(7);
    });

    it('every row contains all ticker keys', async () => {
      const history = await fetchWeeklyHistory();
      const rows = normaliseForComparison(history);
      rows.forEach((row) => {
        history.forEach(({ ticker }) => {
          expect(row).toHaveProperty(ticker);
        });
      });
    });
  });
});
