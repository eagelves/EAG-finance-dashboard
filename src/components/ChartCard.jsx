import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './ChartCard.css';

/**
 * ChartCard — reusable multi-line chart wrapped in a labelled card shell.
 *
 * Props:
 *   title      {string}  Card heading.
 *   subtitle   {string}  Optional secondary label shown below the title.
 *   data       {Array}   Flat row array consumed by Recharts (e.g. [{date, IBM, MSFT}]).
 *   lines      {Array}   Line descriptors: [{ key, name, color }]
 *   yLabel     {string}  Optional y-axis label.
 *   loading    {boolean} When true, renders a skeleton placeholder.
 *   error      {string}  When set, renders an error notice instead of the chart.
 */
function ChartCard({ title, subtitle, data = [], lines = [], yLabel, loading, error }) {
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
            <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#57606a' }}
                tickLine={false}
              />
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
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {lines.map(({ key, name, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ChartCard;
