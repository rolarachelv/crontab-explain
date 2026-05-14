import { resolveAlias, getAliasName, CRON_ALIASES } from './aliases';

describe('resolveAlias', () => {
  it('resolves @daily to correct expression', () => {
    expect(resolveAlias('@daily')).toBe('0 0 * * *');
  });

  it('resolves @yearly', () => {
    expect(resolveAlias('@yearly')).toBe('0 0 1 1 *');
  });

  it('resolves @annually (same as @yearly)', () => {
    expect(resolveAlias('@annually')).toBe('0 0 1 1 *');
  });

  it('resolves @hourly', () => {
    expect(resolveAlias('@hourly')).toBe('0 * * * *');
  });

  it('returns original expression when no alias matches', () => {
    expect(resolveAlias('*/5 * * * *')).toBe('*/5 * * * *');
  });

  it('is case-insensitive', () => {
    expect(resolveAlias('@DAILY')).toBe('0 0 * * *');
  });

  it('trims whitespace before resolving', () => {
    expect(resolveAlias('  @weekly  ')).toBe('0 0 * * 0');
  });
});

describe('getAliasName', () => {
  it('returns alias for a known expression', () => {
    expect(getAliasName('0 0 * * *')).toBe('@yearly');
  });

  it('returns undefined for an expression with no alias', () => {
    expect(getAliasName('*/5 * * * *')).toBeUndefined();
  });

  it('all CRON_ALIASES values are resolvable back', () => {
    for (const [alias, expr] of Object.entries(CRON_ALIASES)) {
      expect(resolveAlias(alias)).toBe(expr);
    }
  });
});
