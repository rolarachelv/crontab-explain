import { buildCanonicalMap, formatCanonicalMap } from './canonicalMap';

describe('buildCanonicalMap', () => {
  it('maps identical expressions to one entry', () => {
    const result = buildCanonicalMap(['0 9 * * *', '0 9 * * *']);
    expect(result.uniqueCount).toBe(1);
    expect(result.totalCount).toBe(2);
    expect(result.duplicates).toHaveLength(1);
  });

  it('maps equivalent expressions (preset vs explicit) to one entry', () => {
    const result = buildCanonicalMap(['@daily', '0 0 * * *']);
    expect(result.uniqueCount).toBe(1);
    expect(result.duplicates).toHaveLength(1);
  });

  it('maps */1 and * to same canonical form', () => {
    const result = buildCanonicalMap(['*/1 * * * *', '* * * * *']);
    expect(result.uniqueCount).toBe(1);
  });

  it('keeps distinct expressions separate', () => {
    const result = buildCanonicalMap(['0 9 * * *', '0 10 * * *']);
    expect(result.uniqueCount).toBe(2);
    expect(result.duplicates).toHaveLength(0);
  });

  it('handles a mixed list correctly', () => {
    const result = buildCanonicalMap([
      '0 9 * * *',
      '0 9 * * *',
      '@daily',
      '0 0 * * *',
      '*/5 * * * *',
    ]);
    expect(result.totalCount).toBe(5);
    expect(result.uniqueCount).toBe(3);
    expect(result.duplicates).toHaveLength(2);
  });

  it('returns empty result for empty input', () => {
    const result = buildCanonicalMap([]);
    expect(result.uniqueCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.duplicates).toHaveLength(0);
  });

  it('throws for invalid expressions', () => {
    expect(() => buildCanonicalMap(['99 99 * * *'])).toThrow();
  });
});

describe('formatCanonicalMap', () => {
  it('includes totals header', () => {
    const result = buildCanonicalMap(['0 9 * * *', '0 10 * * *']);
    const output = formatCanonicalMap(result);
    expect(output).toContain('Total: 2');
    expect(output).toContain('Unique: 2');
  });

  it('marks duplicates with [DUP]', () => {
    const result = buildCanonicalMap(['@daily', '0 0 * * *']);
    const output = formatCanonicalMap(result);
    expect(output).toContain('[DUP]');
  });

  it('shows original expressions for duplicates', () => {
    const result = buildCanonicalMap(['@daily', '0 0 * * *']);
    const output = formatCanonicalMap(result);
    expect(output).toContain('@daily');
    expect(output).toContain('0 0 * * *');
  });

  it('does not mark unique entries with [DUP]', () => {
    const result = buildCanonicalMap(['0 9 * * *']);
    const output = formatCanonicalMap(result);
    expect(output).not.toContain('[DUP]');
  });
});
