import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanySearch from '../components/CompanySearch.jsx';

// Mock Recharts
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

// Mock financeService
vi.mock('../services/financeService.js', () => ({
  COMPANIES:      [],
  COMPANY_COLORS: [],
  fetchCompanyChart: vi.fn(),
  fetchCurrentQuotes:   vi.fn().mockResolvedValue([]),
  fetchWeeklyHistory:   vi.fn().mockResolvedValue([]),
  fetchQuarterlyHistory: vi.fn().mockResolvedValue([]),
  normaliseForComparison: vi.fn().mockReturnValue([]),
}));

import { fetchCompanyChart } from '../services/financeService.js';

describe('CompanySearch (Issue #1)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the input, button and heading', () => {
    render(<CompanySearch />);
    expect(screen.getByLabelText('Ticker symbol')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Chart' })).toBeInTheDocument();
    expect(screen.getByText('Custom Company Chart')).toBeInTheDocument();
  });

  it('shows a validation error when submitted with an empty input', async () => {
    render(<CompanySearch />);
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a ticker symbol.');
    expect(fetchCompanyChart).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid symbol', async () => {
    render(<CompanySearch />);
    await userEvent.type(screen.getByLabelText('Ticker symbol'), '!!!');
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid symbol');
    expect(fetchCompanyChart).not.toHaveBeenCalled();
  });

  it('calls fetchCompanyChart with the uppercased symbol on valid submit', async () => {
    fetchCompanyChart.mockResolvedValue([
      { date: 'Jan 1', price: 180 },
      { date: 'Jan 2', price: 182 },
    ]);

    render(<CompanySearch />);
    await userEvent.type(screen.getByLabelText('Ticker symbol'), 'aapl');
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));

    expect(fetchCompanyChart).toHaveBeenCalledWith('AAPL', 30);
  });

  it('renders the chart after a successful fetch', async () => {
    fetchCompanyChart.mockResolvedValue([
      { date: 'Jan 1', price: 180 },
      { date: 'Jan 2', price: 182 },
    ]);

    render(<CompanySearch />);
    await userEvent.type(screen.getByLabelText('Ticker symbol'), 'AAPL');
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));

    await waitFor(() =>
      expect(screen.getByText('AAPL — Last 30 Days')).toBeInTheDocument(),
    );
  });

  it('shows an error message when no data is returned for the symbol', async () => {
    fetchCompanyChart.mockResolvedValue([]);

    render(<CompanySearch />);
    await userEvent.type(screen.getByLabelText('Ticker symbol'), 'FAKE');
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No data found for "FAKE"'),
    );
  });

  it('shows an error when fetchCompanyChart throws', async () => {
    fetchCompanyChart.mockRejectedValue(new Error('network error'));

    render(<CompanySearch />);
    await userEvent.type(screen.getByLabelText('Ticker symbol'), 'AAPL');
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load data for "AAPL"'),
    );
  });

  it('clears the error when the user starts typing again', async () => {
    render(<CompanySearch />);
    await userEvent.click(screen.getByRole('button', { name: 'Show Chart' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Ticker symbol'), 'A');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
