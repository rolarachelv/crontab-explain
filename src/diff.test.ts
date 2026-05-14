import { diffCrons, formatDiff, CronDiff } from './diff';

describe('diffCrons', () => {
  it('detects identical expressions', () => {
    const result = diffCrons('0 9 * * 1', '0 9 * * 1');
    expect(result.identical).toBe(true);
    expect(result.changes).toHaveLength(0);
  });

  it('detects a single field change', () => {
    const result = diffCrons('0 9 * * 1', '0 10 * * 1');
    expect(result.identical).toBe(false);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].field).toBe('hour');
    expect(result.changes[0].from).toBe('9');
    expect(result.changes[0].to).toBe('10');
  });

  it('detects multiple field changes', () => {
    const result = diffCrons('0 9 * * 1', '30 18 * * 5');
    expect(result.changes.length).toBeGreaterThanOrEqual(2);
    const fields = result.changes.map((c) => c.field);
    expect(fields).toContain('minute');
    expect(fields).toContain('hour');
    expect(fields).toContain('dow');
  });

  it('includes summaries for both expressions', () => {
    const result = diffCrons('0 0 * * *', '0 12 * * *');
    expect(result.summaryA).toBeTruthy();
    expect(result.summaryB).toBeTruthy();
    expect(result.summaryA).not.toBe(result.summaryB);
  });

  it('handles wildcard vs specific value', () => {
    const result = diffCrons('* * * * *', '0 0 * * *');
    expect(result.identical).toBe(false);
    const fields = result.changes.map((c) => c.field);
    expect(fields).toContain('minute');
    expect(fields).toContain('hour');
  });
});

describe('formatDiff', () => {
  it('returns identical message when no changes', () => {
    const result = diffCrons('0 9 * * 1', '0 9 * * 1');
    const output = formatDiff(result);
    expect(output).toContain('identical');
    expect(output).toContain('0 9 * * 1');
  });

  it('formats changes with labels', () => {
    const result = diffCrons('0 9 * * 1', '0 10 * * 1');
    const output = formatDiff(result);
    expect(output).toContain('Hour');
    expect(output).toContain('9');
    expect(output).toContain('10');
    expect(output).toContain('→');
  });

  it('includes both summaries in output', () => {
    const result = diffCrons('0 0 * * *', '0 12 * * *');
    const output = formatDiff(result);
    expect(output).toContain('A:');
    expect(output).toContain('B:');
  });
});
