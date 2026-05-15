import { lintCron, formatLintResult } from './cronLinter';

describe('lintCron', () => {
  test('returns valid for a simple expression', () => {
    const result = lintCron('0 9 * * 1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns invalid for a bad expression', () => {
    const result = lintCron('99 99 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('warns about every-minute expression', () => {
    const result = lintCron('* * * * *');
    expect(result.valid).toBe(true);
    const warn = result.warnings.find(w => w.field === 'minute');
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe('warn');
  });

  test('suggests preset alias for @daily equivalent', () => {
    const result = lintCron('0 0 * * *');
    expect(result.suggestions.some(s => s.includes('@daily'))).toBe(true);
  });

  test('warns when both dom and dow are set', () => {
    const result = lintCron('0 9 15 * 1');
    const warn = result.warnings.find(w => w.field === 'dom/dow');
    expect(warn).toBeDefined();
  });

  test('no warnings for clean weekly expression', () => {
    const result = lintCron('0 9 * * 1');
    expect(result.warnings).toHaveLength(0);
  });

  test('resolves aliases before linting', () => {
    const result = lintCron('@weekly');
    expect(result.valid).toBe(true);
  });

  test('info warning for specific month and day', () => {
    const result = lintCron('0 12 25 12 *');
    const info = result.warnings.find(w => w.field === 'month');
    expect(info).toBeDefined();
    expect(info?.severity).toBe('info');
  });
});

describe('formatLintResult', () => {
  test('formats valid result with no issues', () => {
    const result = lintCron('0 9 * * 1');
    const out = formatLintResult(result);
    expect(out).toContain('✓');
    expect(out).toContain('No issues found');
  });

  test('formats invalid result with errors', () => {
    const result = lintCron('99 99 * * *');
    const out = formatLintResult(result);
    expect(out).toContain('✗');
    expect(out).toContain('ERROR');
  });

  test('formats warnings and suggestions', () => {
    const result = lintCron('* * * * *');
    const out = formatLintResult(result);
    expect(out).toContain('WARN');
  });
});
