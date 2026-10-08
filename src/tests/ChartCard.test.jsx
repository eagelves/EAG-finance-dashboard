import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartCard from '../components/ChartCard.jsx';

// Recharts uses SVG and ResizeObserver which are not fully supported in jsdom.
// We mock ResponsiveContainer so it renders children at a fixed size.
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

describe('ChartCard', () => {
  it('renders the card title', () => {
    render(<ChartCard title="Test Chart" data={[]} lines={[]} />);
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<ChartCard title="Chart" subtitle="Subtitle text" data={[]} lines={[]} />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('shows a loading skeleton when loading is true', () => {
    render(<ChartCard title="Chart" loading data={[]} lines={[]} />);
    expect(screen.getByLabelText('Loading chart data')).toBeInTheDocument();
  });

  it('shows an error message when error is set', () => {
    render(<ChartCard title="Chart" error="Something went wrong" data={[]} lines={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('does not show skeleton or error when data is ready', () => {
    render(<ChartCard title="Chart" data={[{ date: 'Jan 1', IBM: 100 }]} lines={[{ key: 'IBM', name: 'IBM', color: '#0f62fe' }]} />);
    expect(screen.queryByLabelText('Loading chart data')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has a region role with the correct label', () => {
    render(<ChartCard title="My Chart" data={[]} lines={[]} />);
    expect(screen.getByRole('region', { name: 'My Chart' })).toBeInTheDocument();
  });
});
