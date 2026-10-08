import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../pages/Dashboard.jsx';

// Mock Recharts to avoid SVG/ResizeObserver issues in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

// Mock the finance service so tests never hit the network
vi.mock('../services/financeService.js', () => ({
  COMPANIES:      [{ ticker: 'IBM', name: 'IBM' }, { ticker: 'MSFT', name: 'Microsoft' }],
  COMPANY_COLORS: ['#0f62fe', '#107c41'],
  fetchCurrentQuotes: vi.fn().mockResolvedValue([
    { ticker: 'IBM',  name: 'IBM',       price: 185,  change: 1,  changePct: 0.5,  volume: 1_000_000 },
    { ticker: 'MSFT', name: 'Microsoft', price: 415,  change: -1, changePct: -0.2, volume: 2_000_000 },
  ]),
  fetchWeeklyHistory: vi.fn().mockResolvedValue([
    { ticker: 'IBM',  name: 'IBM',       color: '#0f62fe', series: [{ date: 'Jan 1', price: 185 }] },
    { ticker: 'MSFT', name: 'Microsoft', color: '#107c41', series: [{ date: 'Jan 1', price: 415 }] },
  ]),
  fetchQuarterlyHistory: vi.fn().mockResolvedValue([
    { ticker: 'IBM',  name: 'IBM',       color: '#0f62fe', series: [{ date: 'Jan 1', price: 185 }] },
    { ticker: 'MSFT', name: 'Microsoft', color: '#107c41', series: [{ date: 'Jan 1', price: 415 }] },
  ]),
  normaliseForComparison: vi.fn().mockReturnValue([{ date: 'Jan 1', IBM: 100, MSFT: 100 }]),
}));

describe('Dashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders three tab buttons', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Current Day' })).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: 'Last 7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Last Quarter' })).toBeInTheDocument();
  });

  it('shows the Current Day tab as selected by default', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Current Day' })).toHaveAttribute('aria-selected', 'true');
    });
    expect(screen.getByRole('tab', { name: 'Last 7 Days' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to the 7-day tab when clicked', async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Last 7 Days' })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Last 7 Days' }));
    expect(screen.getByRole('tab', { name: 'Last 7 Days' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Current Day' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to the quarter tab when clicked', async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Last Quarter' })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Last Quarter' }));
    expect(screen.getByRole('tab', { name: 'Last Quarter' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders the Refresh button', async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Refresh data' })).toBeInTheDocument(),
    );
  });
});
