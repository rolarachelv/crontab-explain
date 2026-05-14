import { resolvePreset, isPreset, expandPreset, listPresets } from './presets';

describe('resolvePreset', () => {
  it('resolves @daily to the correct expression', () => {
    const preset = resolvePreset('@daily');
    expect(preset).toBeDefined();
    expect(preset!.expression).toBe('0 0 * * *');
  });

  it('resolves @yearly and @annually to the same expression', () => {
    const yearly   = resolvePreset('@yearly');
    const annually = resolvePreset('@annually');
    expect(yearly!.expression).toBe(annually!.expression);
  });

  it('is case-insensitive', () => {
    expect(resolvePreset('@DAILY')).toBeDefined();
    expect(resolvePreset('@Daily')).toBeDefined();
  });

  it('returns undefined for unknown presets', () => {
    expect(resolvePreset('@unknown')).toBeUndefined();
    expect(resolvePreset('0 * * * *')).toBeUndefined();
  });

  it('trims whitespace before lookup', () => {
    expect(resolvePreset('  @hourly  ')).toBeDefined();
  });
});

describe('isPreset', () => {
  it('returns true for known presets', () => {
    expect(isPreset('@weekly')).toBe(true);
    expect(isPreset('@monthly')).toBe(true);
    expect(isPreset('@reboot')).toBe(true);
  });

  it('returns false for regular cron expressions', () => {
    expect(isPreset('0 9 * * 1')).toBe(false);
    expect(isPreset('*/5 * * * *')).toBe(false);
  });
});

describe('expandPreset', () => {
  it('expands a known preset to its expression', () => {
    expect(expandPreset('@hourly')).toBe('0 * * * *');
    expect(expandPreset('@midnight')).toBe('0 0 * * *');
  });

  it('returns the original string when not a preset', () => {
    expect(expandPreset('5 4 * * *')).toBe('5 4 * * *');
    expect(expandPreset('*/10 * * * *')).toBe('*/10 * * * *');
  });
});

describe('listPresets', () => {
  it('returns an array of preset names', () => {
    const names = listPresets();
    expect(Array.isArray(names)).toBe(true);
    expect(names).toContain('@daily');
    expect(names).toContain('@hourly');
    expect(names).toContain('@reboot');
  });

  it('returns at least 8 presets', () => {
    expect(listPresets().length).toBeGreaterThanOrEqual(8);
  });
});
