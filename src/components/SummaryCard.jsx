import './SummaryCard.css';

/**
 * SummaryCard — compact metric card for a single company's current quote.
 *
 * Props:
 *   ticker     {string}  Stock ticker symbol (e.g. "IBM").
 *   name       {string}  Company display name.
 *   price      {number}  Latest price.
 *   change     {number}  Absolute price change from previous close.
 *   changePct  {number}  Percentage change from previous close.
 *   volume     {number}  Trading volume.
 *   loading    {boolean} Shows skeleton when true.
 */
function SummaryCard({ ticker, name, price, change, changePct, volume, loading }) {
  if (loading) {
    return <div className="summary-card summary-card--skeleton" aria-busy="true" aria-label="Loading quote" />;
  }

  const isPositive = change >= 0;
  const sign = isPositive ? '+' : '';

  return (
    <div
      className={`summary-card ${isPositive ? 'summary-card--up' : 'summary-card--down'}`}
      role="region"
      aria-label={`${name} quote`}
    >
      <div className="summary-card__ticker">{ticker}</div>
      <div className="summary-card__name">{name}</div>

      <div className="summary-card__price">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

      <div className="summary-card__change">
        <span className="summary-card__badge">
          {sign}{change.toFixed(2)} ({sign}{changePct.toFixed(2)}%)
        </span>
      </div>

      <div className="summary-card__volume">
        Vol: {volume.toLocaleString('en-US')}
      </div>
    </div>
  );
}

export default SummaryCard;
