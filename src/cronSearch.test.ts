import { searchUpcoming, formatSearchResults } from './cronSearch';

// Fixed reference point: 2024-01-15 12:00:00 UTC (Monday)
const BASE = new Date('2024-01-15T12:00:00Z');

describe('searchUpcoming', () => {
  it('returns expression that fires within the window', () => {
    // every minute — always fires within 60 min
    const results = searchUpcoming(['* * * * *'], { from: BASE, withinMinutes: 60 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].expression).toBe('* * * * *');
  });

  it('excludes expressions outside the window', () => {
    // fires at 23:59 — outside a 60-min window from 12:00
    const results = searchUpcoming(['59 23 * * *'], { from: BASE, withinMinutes: 60 });
    expect(results).toHaveLength(0);
  });

  it('respects withinMinutes option', () => {
    // fires at 12:05
    const results = searchUpcoming(['5 12 * * *'], { from: BASE, withinMinutes: 10 });
    expect(results).toHaveLength(1);
    expect(results[0].minutesFromNow).toBe(5);
  });

  it('skips invalid expressions silently', () => {
    const results = searchUpcoming(['* * * * *', 'not-valid'], { from: BASE });
    expect(results.every(r => r.expression !== 'not-valid')).toBe(true);
  });

  it('sorts results by nextRun ascending', () => {
    const exprs = ['30 12 * * *', '10 12 * * *', '20 12 * * *'];
    const results = searchUpcoming(exprs, { from: BASE, withinMinutes: 120 });
    for (let i = 1; i < results.length; i++) {
      expect(results[i].nextRun.getTime()).toBeGreaterThanOrEqual(
        results[i - 1].nextRun.getTime()
      );
    }
  });

  it('respects maxResults', () => {
    const exprs = Array.from({ length: 20 }, () => '* * * * *');
    const results = searchUpcoming(exprs, { from: BASE, maxResults: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('returns empty array for empty input', () => {
    expect(searchUpcoming([], { from: BASE })).toEqual([]);
  });
});

describe('formatSearchResults', () => {
  it('shows no-match message when empty', () => {
    const out = formatSearchResults([], 30);
    expect(out).toContain('No expressions');
    expect(out).toContain('30');
  });

  it('includes expression and time in output', () => {
    const matches = searchUpcoming(['* * * * *'], { from: BASE, withinMinutes: 5 });
    const out = formatSearchResults(matches, 5);
    expect(out).toContain('* * * * *');
    expect(out).toContain('UTC');
  });
});
