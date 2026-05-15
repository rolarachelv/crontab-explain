import { collapseFullRange, normalizeCron, formatNormalize } from './cronNormalizer';

describe('collapseFullRange', () => {
  it('returns * for * input', () => {
    expect(collapseFullRange('*', 0, 59)).toBe('*');
  });

  it('returns * for */1', () => {
    expect(collapseFullRange('*/1', 0, 59)).toBe('*');
  });

  it('collapses full minute range 0-59', () => {
    expect(collapseFullRange('0-59', 0, 59)).toBe('*');
  });

  it('collapses full hour range 0-23', () => {
    expect(collapseFullRange('0-23', 0, 23)).toBe('*');
  });

  it('does not collapse partial range', () => {
    expect(collapseFullRange('0-30', 0, 59)).toBe('0-30');
  });

  it('does not collapse step expressions', () => {
    expect(collapseFullRange('*/5', 0, 59)).toBe('*/5');
  });
});

describe('normalizeCron', () => {
  it('leaves canonical expression unchanged', () => {
    const result = normalizeCron('0 9 * * 1');
    expect(result.normalized).toBe('0 9 * * 1');
    expect(result.changes).toHaveLength(0);
  });

  it('collapses */1 to *', () => {
    const result = normalizeCron('*/1 */1 * * *');
    expect(result.normalized).toBe('* * * * *');
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it('expands @daily preset', () => {
    const result = normalizeCron('@daily');
    expect(result.normalized).toBe('0 0 * * *');
    expect(result.changes.some(c => c.includes('@daily'))).toBe(true);
  });

  it('expands @weekly preset', () => {
    const result = normalizeCron('@weekly');
    expect(result.normalized).toBe('0 0 * * 0');
  });

  it('collapses full range fields', () => {
    const result = normalizeCron('0-59 0-23 1-31 1-12 0-7');
    expect(result.normalized).toBe('* * * * *');
  });

  it('preserves partial ranges', () => {
    const result = normalizeCron('0 9-17 * * 1-5');
    expect(result.normalized).toBe('0 9-17 * * 1-5');
  });

  it('records original expression', () => {
    const result = normalizeCron('@daily');
    expect(result.original).toBe('@daily');
  });
});

describe('formatNormalize', () => {
  it('shows no-change message for canonical expression', () => {
    const result = normalizeCron('0 9 * * 1');
    const output = formatNormalize(result);
    expect(output).toContain('already canonical');
  });

  it('lists changes when normalization occurs', () => {
    const result = normalizeCron('@daily');
    const output = formatNormalize(result);
    expect(output).toContain('Changes:');
    expect(output).toContain('@daily');
  });

  it('includes original and normalized lines', () => {
    const result = normalizeCron('*/1 * * * *');
    const output = formatNormalize(result);
    expect(output).toContain('Original');
    expect(output).toContain('Normalized');
  });
});
