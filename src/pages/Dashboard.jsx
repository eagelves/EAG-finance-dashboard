import { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import AreaChartCard from '../components/AreaChartCard.jsx';
import RankingCard from '../components/RankingCard.jsx';
import {
  COMPANIES,
  COMPANY_COLORS,
  fetchCurrentQuotes,
  fetchWeeklyHistory,
  fetchQuarterlyHistory,
  normaliseForComparison,
} from '../services/financeService.js';
import './Dashboard.css';

const TABS = [
  { id: 'today',   label: 'Current Day' },
  { id: 'week',    label: 'Last 7 Days' },
  { id: 'quarter', label: 'Last Quarter' },
];

/**
 * Fire all three data-fetch calls and push results into React state.
 * Extracted outside the component so it can be called both on mount
 * and when the user clicks Refresh — without violating the hooks rules.
 */
function loadAllData(setters) {
  const {
    setQuotes, setWeekly, setQuarterly,
    setLoadingQuotes, setLoadingWeekly, setLoadingQuarterly,
    setErrorQuotes, setErrorWeekly, setErrorQuarterly,
  } = setters;

  setLoadingQuotes(true);
  setLoadingWeekly(true);
  setLoadingQuarterly(true);
  setErrorQuotes(null);
  setErrorWeekly(null);
  setErrorQuarterly(null);

  fetchCurrentQuotes()
    .then(setQuotes)
    .catch(() => setErrorQuotes('Unable to load current quotes.'))
    .finally(() => setLoadingQuotes(false));

  fetchWeeklyHistory()
    .then(setWeekly)
    .catch(() => setErrorWeekly('Unable to load 7-day history.'))
    .finally(() => setLoadingWeekly(false));

  fetchQuarterlyHistory()
    .then(setQuarterly)
    .catch(() => setErrorQuarterly('Unable to load quarterly history.'))
    .finally(() => setLoadingQuarterly(false));
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('today');

  const [quotes,    setQuotes]    = useState([]);
  const [weekly,    setWeekly]    = useState([]);
  const [quarterly, setQuarterly] = useState([]);

  const [loadingQuotes,    setLoadingQuotes]    = useState(true);
  const [loadingWeekly,    setLoadingWeekly]    = useState(true);
  const [loadingQuarterly, setLoadingQuarterly] = useState(true);

  const [errorQuotes,    setErrorQuotes]    = useState(null);
  const [errorWeekly,    setErrorWeekly]    = useState(null);
  const [errorQuarterly, setErrorQuarterly] = useState(null);

  const stateSetters = {
    setQuotes, setWeekly, setQuarterly,
    setLoadingQuotes, setLoadingWeekly, setLoadingQuarterly,
    setErrorQuotes, setErrorWeekly, setErrorQuarterly,
  };

  // Load data once on mount
  useEffect(() => {
    loadAllData(stateSetters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => loadAllData(stateSetters);

  // Line / area descriptors — one per company
  const seriesLines = COMPANIES.map(({ ticker, name }, i) => ({
    key: ticker, name, color: COMPANY_COLORS[i],
  }));

  const weeklyData    = normaliseForComparison(weekly);
  const quarterlyData = normaliseForComparison(quarterly);

  return (
    <div className="dashboard">

      {/* ── Tab navigation ── */}
      <nav className="dashboard__tabs" role="tablist" aria-label="Time window">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            className={`dashboard__tab ${activeTab === id ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
        <button className="dashboard__refresh" onClick={handleRefresh} aria-label="Refresh data">
          ↻ Refresh
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════
          Current Day — quote cards + performance ranking
         ══════════════════════════════════════════════════ */}
      {activeTab === 'today' && (
        <section aria-labelledby="today-heading">
          <h2 id="today-heading" className="dashboard__section-title">
            Current Day — Market Summary
          </h2>

          {/* Quote summary cards */}
          <div className="dashboard__cards-grid">
            {loadingQuotes
              ? COMPANIES.map(({ ticker }) => <SummaryCard key={ticker} loading />)
              : quotes.map((q) => (
                  <SummaryCard
                    key={q.ticker}
                    ticker={q.ticker}
                    name={q.name}
                    price={q.price}
                    change={q.change}
                    changePct={q.changePct}
                    volume={q.volume}
                  />
                ))
            }
          </div>

          {errorQuotes && <p className="dashboard__error">{errorQuotes}</p>}

          {/* Ranked performance list */}
          <div className="dashboard__ranking">
            <RankingCard quotes={quotes} loading={loadingQuotes} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          Last 7 Days — area chart (relative performance)
         ══════════════════════════════════════════════════ */}
      {activeTab === 'week' && (
        <section aria-labelledby="week-heading">
          <h2 id="week-heading" className="dashboard__section-title">
            Last 7 Days — Relative Performance
          </h2>
          <AreaChartCard
            title="7-Day Price Movement"
            subtitle="Indexed to 100 at the start of the period"
            data={weeklyData}
            lines={seriesLines}
            yLabel="Index (100 = start)"
            loading={loadingWeekly}
            error={errorWeekly}
          />
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          Last Quarter — line chart + area chart side-by-side
         ══════════════════════════════════════════════════ */}
      {activeTab === 'quarter' && (
        <section aria-labelledby="quarter-heading">
          <h2 id="quarter-heading" className="dashboard__section-title">
            Last Quarter — Trend Comparison
          </h2>
          <div className="dashboard__charts-row">
            <ChartCard
              title="Quarterly Price Trend"
              subtitle="Absolute price (USD)"
              data={quarterly.length
                ? quarterly[0].series.map(({ date }) => {
                    const row = { date };
                    quarterly.forEach(({ ticker, series }) => {
                      const pt = series.find((s) => s.date === date);
                      if (pt) row[ticker] = pt.price;
                    });
                    return row;
                  })
                : []}
              lines={seriesLines}
              yLabel="Price (USD)"
              loading={loadingQuarterly}
              error={errorQuarterly}
            />
            <AreaChartCard
              title="Quarterly Relative Performance"
              subtitle="Indexed to 100 at the start of the quarter"
              data={quarterlyData}
              lines={seriesLines}
              yLabel="Index (100 = start)"
              loading={loadingQuarterly}
              error={errorQuarterly}
            />
          </div>
        </section>
      )}

    </div>
  );
}

export default Dashboard;
