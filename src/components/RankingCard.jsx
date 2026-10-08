import './RankingCard.css';

/**
 * RankingCard — ranked list of companies by daily % change.
 *
 * Props:
 *   quotes   {QuoteSummary[]}  Array from fetchCurrentQuotes().
 *   loading  {boolean}
 */
function RankingCard({ quotes = [], loading }) {
  if (loading) {
    return (
      <div className="ranking-card ranking-card--skeleton" aria-busy="true" aria-label="Loading rankings" />
    );
  }

  const sorted = [...quotes].sort((a, b) => b.changePct - a.changePct);

  return (
    <div className="ranking-card" role="region" aria-label="Daily performance ranking">
      <div className="ranking-card__header">
        <h2 className="ranking-card__title">Daily Performance Ranking</h2>
        <p className="ranking-card__subtitle">Sorted by % change from previous close</p>
      </div>
      <ol className="ranking-card__list">
        {sorted.map((q, i) => {
          const isPos = q.changePct >= 0;
          const sign  = isPos ? '+' : '';
          return (
            <li key={q.ticker} className="ranking-card__row">
              <span className="ranking-card__rank">{i + 1}</span>
              <span className="ranking-card__ticker">{q.ticker}</span>
              <span className="ranking-card__name">{q.name}</span>
              <span className={`ranking-card__pct ${isPos ? 'ranking-card__pct--up' : 'ranking-card__pct--down'}`}>
                {sign}{q.changePct.toFixed(2)}%
              </span>
              <span className="ranking-card__price">${q.price.toFixed(2)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default RankingCard;
