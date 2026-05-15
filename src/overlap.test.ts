import { findOverlaps, formatOverlap } from './overlap';

const BASE = new Date('2024-01-01T00:00:00Z');

describe('findOverlaps', () => {
  it('finds overlaps between two identical expressions', () => {
    const result = findOverlaps('*/5 * * * *', '*/5 * * * *', BASE, 10);
    expect(result.count).toBeGreaterThan(0);
    expect(result.overlaps.length).toBe(result.count);
  });

  it('returns no overlaps for non-overlapping expressions', () => {
    // one runs at :01, other at :02 each hour
    const result = findOverlaps('1 * * * *', '2 * * * *', BASE, 20);
    expect(result.count).toBe(0);
  });

  it('finds overlaps for expressions that share some minutes', () => {
    // every 10 min vs every 30 min — overlap at :00 and :30
    const result = findOverlaps('*/10 * * * *', '*/30 * * * *', BASE, 60);
    expect(result.count).toBeGreaterThan(0);
    // All overlap times should be multiples of 30 minutes from BASE
    for (const d of result.overlaps) {
      expect(d.getMinutes() % 30).toBe(0);
    }
  });

  it('returns sorted overlap times', () => {
    const result = findOverlaps('*/15 * * * *', '*/5 * * * *', BASE, 50);
    for (let i = 1; i < result.overlaps.length; i++) {
      expect(result.overlaps[i].getTime()).toBeGreaterThan(
        result.overlaps[i - 1].getTime()
      );
    }
  });

  it('deduplicates overlapping timestamps', () => {
    const result = findOverlaps('0 * * * *', '0 * * * *', BASE, 20);
    const times = result.overlaps.map(d => d.getTime());
    const unique = new Set(times);
    expect(unique.size).toBe(times.length);
  });

  it('sets expressionA and expressionB on result', () => {
    const result = findOverlaps('*/5 * * * *', '*/10 * * * *', BASE, 5);
    expect(result.expressionA).toBe('*/5 * * * *');
    expect(result.expressionB).toBe('*/10 * * * *');
  });
});

describe('formatOverlap', () => {
  it('includes both expressions in output', () => {
    const result = findOverlaps('*/5 * * * *', '*/10 * * * *', BASE, 10);
    const output = formatOverlap(result);
    expect(output).toContain('*/5 * * * *');
    expect(output).toContain('*/10 * * * *');
  });

  it('shows none message when no overlaps', () => {
    const result = findOverlaps('1 * * * *', '2 * * * *', BASE, 10);
    const output = formatOverlap(result);
    expect(output).toContain('none found');
  });

  it('lists ISO timestamps for overlaps', () => {
    const result = findOverlaps('0 * * * *', '*/30 * * * *', BASE, 10);
    const output = formatOverlap(result);
    expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
