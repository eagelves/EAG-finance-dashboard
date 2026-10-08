import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './ChartCard.css'; // reuses the same card shell styles

/**
 * AreaChartCard — stacked/overlapping area chart wrapped in the card shell.
 *
 * Props identical to ChartCard except it renders filled areas instead of lines.
 *   title, subtitle, data, lines, yLabel, loading, error
 */
function AreaChartCard({ title, subtitle, data = [], lines = [], yLabel, loading, error }) {
  return (
    <div className="chart-card" role="region" aria-label={title}>
      <div className="chart-card__header">
        <h2 className="chart-card__title">{title}</h2>
        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
      </div>

      <div className="chart-card__body">
        {loading && (
          <div className="chart-card__skeleton" aria-busy="true" aria-label="Loading chart data" />
        )}
        {!loading && error && (
          <p className="chart-card__error" role="alert">{error}</p>
        )}
        {!loading && !error && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <defs>
                {lines.map(({ key, color }) => (
                  <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#57606a' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#57606a' }}
                tickLine={false}
                axisLine={false}
                label={
                  yLabel
                    ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#57606a' } }
                    : undefined
                }
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {lines.map(({ key, name, color }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#fill-${key})`}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AreaChartCard;
