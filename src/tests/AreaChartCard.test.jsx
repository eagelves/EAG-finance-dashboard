import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AreaChartCard from '../components/AreaChartCard.jsx';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

describe('AreaChartCard', () => {
  it('renders the title', () => {
    render(<AreaChartCard title="Area Test" data={[]} lines={[]} />);
    expect(screen.getByText('Area Test')).toBeInTheDocument();
  });

  it('shows a loading skeleton when loading is true', () => {
    render(<AreaChartCard title="Area Test" loading data={[]} lines={[]} />);
    expect(screen.getByLabelText('Loading chart data')).toBeInTheDocument();
  });

  it('shows an error alert when error is set', () => {
    render(<AreaChartCard title="Area Test" error="Fetch failed" data={[]} lines={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Fetch failed');
  });

  it('renders without error for valid data and lines', () => {
    const data  = [{ date: 'Jan 1', IBM: 100, MSFT: 100 }];
    const lines = [
      { key: 'IBM',  name: 'IBM',       color: '#0f62fe' },
      { key: 'MSFT', name: 'Microsoft', color: '#107c41' },
    ];
    render(<AreaChartCard title="Area Test" data={data} lines={lines} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Loading chart data')).not.toBeInTheDocument();
  });
});
