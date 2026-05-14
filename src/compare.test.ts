import { compareNextRuns, formatCompare, CompareResult } from './compare';

describe('compareNextRuns', () => {
  it('returns an entry per expression', () => {
    const result = compareNextRuns(['0 9 * * *', '0 17 * * *']);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].expression).toBe('0 9 * * *');
    expect(result.entries[1].expression).toBe('0 17 * * *');
  });

  it('returns the requested number of next runs', () => {
    const result = compareNextRuns(['* * * * *'], 5);
    expect(result.entries[0].nextRuns).toHaveLength(5);
  });

  it('identifies the earliest next run across expressions', () => {
    const result = compareNextRuns(['0 23 * * *', '* * * * *']);
    expect(result.earliestNext).not.toBeNull();
    expect(result.earliestNext?.expression).toBe('* * * * *');
  });

  it('handles a single expression', () => {
    const result = compareNextRuns(['0 0 1 * *'], 2);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].nextRuns).toHaveLength(2);
    expect(result.earliestNext?.expression).toBe('0 0 1 * *');
  });

  it('returns null earliestNext for empty list', () => {
    const result = compareNextRuns([]);
    expect(result.earliestNext).toBeNull();
    expect(result.entries).toHaveLength(0);
  });

  it('next runs are Date instances', () => {
    const result = compareNextRuns(['0 6 * * 1']);
    for (const run of result.entries[0].nextRuns) {
      expect(run).toBeInstanceOf(Date);
    }
  });
});

describe('formatCompare', () => {
  it('includes all expressions in output', () => {
    const result = compareNextRuns(['0 9 * * *', '30 14 * * *']);
    const output = formatCompare(result);
    expect(output).toContain('0 9 * * *');
    expect(output).toContain('30 14 * * *');
  });

  it('includes earliest next run label', () => {
    const result = compareNextRuns(['* * * * *', '0 0 1 1 *']);
    const output = formatCompare(result);
    expect(output).toContain('Earliest next run');
    expect(output).toContain('* * * * *');
  });

  it('outputs a non-empty string', () => {
    const result = compareNextRuns(['0 12 * * *']);
    expect(formatCompare(result).length).toBeGreaterThan(0);
  });
});
