import { explainCron, formatExplainer } from './cronExplainer';

describe('explainCron', () => {
  it('returns a result object for a valid expression', () => {
    const result = explainCron('0 9 * * 1-5');
    expect(result.expression).toBe('0 9 * * 1-5');
    expect(result.summary).toBeTruthy();
    expect(typeof result.summary).toBe('string');
  });

  it('includes fieldBreakdown with expected keys', () => {
    const result = explainCron('*/15 * * * *');
    const keys = Object.keys(result.fieldBreakdown);
    expect(keys).toContain('minute');
    expect(keys).toContain('hour');
    expect(keys).toContain('dom');
    expect(keys).toContain('month');
    expect(keys).toContain('dow');
  });

  it('generates a plain text output', () => {
    const result = explainCron('0 0 1 * *');
    expect(result.plain).toContain('Expression');
    expect(result.plain).toContain('Summary');
    expect(result.plain).toContain('Field Breakdown');
  });

  it('throws for an invalid expression', () => {
    expect(() => explainCron('invalid')).toThrow();
  });

  it('handles wildcard expression', () => {
    const result = explainCron('* * * * *');
    expect(result.summary).toBeTruthy();
  });

  it('handles step expressions', () => {
    const result = explainCron('*/5 */2 * * *');
    expect(result.fieldBreakdown.minute).toContain('5');
  });
});

describe('formatExplainer', () => {
  it('returns the plain text from the result', () => {
    const result = explainCron('30 8 * * 1');
    const formatted = formatExplainer(result);
    expect(formatted).toBe(result.plain);
  });

  it('contains the original expression', () => {
    const expr = '0 12 * * 0';
    const result = explainCron(expr);
    const formatted = formatExplainer(result);
    expect(formatted).toContain(expr);
  });
});
