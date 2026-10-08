import { useState } from 'react';
import AreaChartCard from './AreaChartCard.jsx';
import { fetchCompanyChart } from '../services/financeService.js';
import './CompanySearch.css';

/**
 * CompanySearch — Issue #1: "Add a graph for a user-selected company"
 *
 * Renders a ticker input, fetches price history via the finance service,
 * and displays a chart for the chosen company without touching the existing
 * IBM / competitor dashboards.
 *
 * Acceptance criteria covered:
 *   ✅ User can enter a ticker symbol
 *   ✅ Input is validated (non-empty, uppercase letters only)
 *   ✅ Loading state while data is retrieved
 *   ✅ Error state for invalid / unavailable symbols
 *   ✅ Existing dashboards remain intact (this component is additive)
 */
function CompanySearch() {
  const [input,   setInput]   = useState('');
  const [ticker,  setTicker]  = useState(null);
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /** Basic client-side validation — 1-5 uppercase letters/dots */
  function validate(value) {
    if (!value.trim()) return 'Please enter a ticker symbol.';
    if (!/^[A-Z0-9.]{1,10}$/i.test(value.trim())) {
      return 'Invalid symbol. Use letters and numbers only (e.g. AAPL, NVDA).';
    }
    return null;
  }

  async function handleSearch(e) {
    e.preventDefault();
    const symbol = input.trim().toUpperCase();

    const validationError = validate(symbol);
    if (validationError) {
      setError(validationError);
      return;
    }

    setTicker(symbol);
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const result = await fetchCompanyChart(symbol, 30);
      if (!result.length) {
        setError(`No data found for "${symbol}". Check the symbol and try again.`);
      } else {
        // Build flat rows keyed by the ticker for Recharts
        setData(result.map(({ date, price }) => ({ date, [symbol]: price })));
      }
    } catch {
      setError(`Could not load data for "${symbol}". Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  const chartLines = ticker
    ? [{ key: ticker, name: ticker, color: '#7c5cd8' }]
    : [];

  return (
    <section className="company-search" aria-labelledby="custom-search-heading">
      <h2 id="custom-search-heading" className="company-search__title">
        Custom Company Chart
      </h2>
      <p className="company-search__desc">
        Enter any ticker symbol to see its 30-day price history.
      </p>

      <form className="company-search__form" onSubmit={handleSearch} noValidate>
        <input
          className="company-search__input"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          placeholder="e.g. AAPL, NVDA, GOOGL"
          aria-label="Ticker symbol"
          maxLength={10}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button
          className="company-search__btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Show Chart'}
        </button>
      </form>

      {error && (
        <p className="company-search__error" role="alert">{error}</p>
      )}

      {(loading || data.length > 0) && (
        <div className="company-search__chart">
          <AreaChartCard
            title={`${ticker} — Last 30 Days`}
            subtitle="Price in USD"
            data={data}
            lines={chartLines}
            yLabel="Price (USD)"
            loading={loading}
            error={null}
          />
        </div>
      )}
    </section>
  );
}

export default CompanySearch;
