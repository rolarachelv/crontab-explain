import { getPastRuns, formatHistory } from './history';
import { parseCron } from './parser';

describe('getPastRuns', () => {
  const base = new Date('2024-06-15T12:30:00Z');

  it('returns the correct number of past runs for a simple expression', () => {
    const expr = parseCron('* * * * *');
    const runs = getPastRuns(expr, 5, base);
    expect(runs).toHaveLength(5);
  });

  it('returns runs in descending order (most recent first)', () => {
    const expr = parseCron('* * * * *');
    const runs = getPastRuns(expr, 3, base);
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i - 1].getTime()).toBeGreaterThan(runs[i].getTime());
    }
  });

  it('returns hourly runs correctly', () => {
    const expr = parseCron('0 * * * *');
    const runs = getPastRuns(expr, 3, base);
    expect(runs).toHaveLength(3);
    runs.forEach(d => expect(d.getMinutes()).toBe(0));
  });

  it('returns daily runs at midnight', () => {
    const before = new Date('2024-06-15T00:05:00Z');
    const expr = parseCron('0 0 * * *');
    const runs = getPastRuns(expr, 1, before);
    expect(runs).toHaveLength(1);
    expect(runs[0].getUTCHours()).toBe(0);
    expect(runs[0].getUTCMinutes()).toBe(0);
  });

  it('returns empty array for unreachable expression within window', () => {
    // Feb 30 never happens — dom=30 month=2
    const expr = parseCron('0 0 30 2 *');
    const runs = getPastRuns(expr, 1, base);
    expect(runs).toHaveLength(0);
  });
});

describe('formatHistory', () => {
  it('returns a message when no dates provided', () => {
    const output = formatHistory([]);
    expect(output).toMatch(/No past runs/);
  });

  it('includes numbered entries for each date', () => {
    const dates = [
      new Date('2024-06-15T12:00:00Z'),
      new Date('2024-06-15T11:00:00Z'),
    ];
    const output = formatHistory(dates);
    expect(output).toMatch(/1\./);
    expect(output).toMatch(/2\./);
    expect(output).toMatch(/Last 2 run/);
  });

  it('includes UTC label when no timezone given', () => {
    const dates = [new Date('2024-06-15T10:00:00Z')];
    const output = formatHistory(dates);
    expect(output).toMatch(/UTC/);
  });
});
