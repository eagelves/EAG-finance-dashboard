import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RankingCard from '../components/RankingCard.jsx';

const MOCK_QUOTES = [
  { ticker: 'IBM',  name: 'IBM',       price: 185.00, change:  1.50, changePct:  0.82, volume: 3_000_000 },
  { ticker: 'MSFT', name: 'Microsoft', price: 415.00, change: -2.10, changePct: -0.50, volume: 5_000_000 },
  { ticker: 'ORCL', name: 'Oracle',    price: 140.00, change:  3.20, changePct:  2.34, volume: 2_000_000 },
];

describe('RankingCard', () => {
  it('renders a loading placeholder when loading is true', () => {
    render(<RankingCard quotes={[]} loading />);
    expect(screen.getByLabelText('Loading rankings')).toBeInTheDocument();
  });

  it('renders a row for every quote', () => {
    render(<RankingCard quotes={MOCK_QUOTES} />);
    // IBM appears in both the ticker and the name span — use getAllByText
    expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
    expect(screen.getByText('Oracle')).toBeInTheDocument();
  });

  it('sorts by changePct descending (best performer first)', () => {
    render(<RankingCard quotes={MOCK_QUOTES} />);
    const rows = screen.getAllByRole('listitem');
    // ORCL (+2.34%) should be first, then IBM (+0.82%), then MSFT (−0.50%)
    expect(rows[0]).toHaveTextContent('ORCL');
    expect(rows[1]).toHaveTextContent('IBM');
    expect(rows[2]).toHaveTextContent('MSFT');
  });

  it('shows a positive pct with a + sign', () => {
    render(<RankingCard quotes={MOCK_QUOTES} />);
    expect(screen.getByText('+2.34%')).toBeInTheDocument();
  });

  it('shows a negative pct without a + sign', () => {
    render(<RankingCard quotes={MOCK_QUOTES} />);
    expect(screen.getByText('-0.50%')).toBeInTheDocument();
  });

  it('has a region role for accessibility', () => {
    render(<RankingCard quotes={MOCK_QUOTES} />);
    expect(screen.getByRole('region', { name: 'Daily performance ranking' })).toBeInTheDocument();
  });
});
