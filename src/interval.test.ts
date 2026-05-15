import { getIntervalInfo, runsPerDay } from './interval';
import { CronExpression } from './types';

function makeExpr(overrides: Partial<CronExpression>): CronExpression {
  return {
    minute: '*',
    hour: '*',
    dom: '*',
    month: '*',
    dow: '*',
    raw: '',
    ...overrides,
  };
}

describe('getIntervalInfo', () => {
  it('detects every-15-minutes pattern', () => {
    const info = getIntervalInfo(makeExpr({ minute: '*/15' }));
    expect(info.hasFixedInterval).toBe(true);
    expect(info.intervalMinutes).toBe(15);
    expect(info.intervalHours).toBeNull();
    expect(info.description).toBe('Every 15 minutes');
  });

  it('detects every-1-minute pattern', () => {
    const info = getIntervalInfo(makeExpr({ minute: '*/1' }));
    expect(info.hasFixedInterval).toBe(true);
    expect(info.intervalMinutes).toBe(1);
    expect(info.description).toBe('Every 1 minute');
  });

  it('detects every-2-hours pattern', () => {
    const info = getIntervalInfo(makeExpr({ minute: '0', hour: '*/2' }));
    expect(info.hasFixedInterval).toBe(true);
    expect(info.intervalHours).toBe(2);
    expect(info.intervalMinutes).toBe(120);
    expect(info.description).toBe('Every 2 hours');
  });

  it('detects every-1-hour pattern', () => {
    const info = getIntervalInfo(makeExpr({ minute: '0', hour: '*/1' }));
    expect(info.hasFixedInterval).toBe(true);
    expect(info.intervalHours).toBe(1);
    expect(info.description).toBe('Every 1 hour');
  });

  it('returns non-uniform for fixed time expressions', () => {
    const info = getIntervalInfo(makeExpr({ minute: '30', hour: '9' }));
    expect(info.hasFixedInterval).toBe(false);
    expect(info.description).toBe('Non-uniform interval');
  });

  it('returns non-uniform when dom is restricted', () => {
    const info = getIntervalInfo(makeExpr({ minute: '*/5', dom: '1' }));
    expect(info.hasFixedInterval).toBe(false);
  });
});

describe('runsPerDay', () => {
  it('calculates runs per day for 15-minute interval', () => {
    const info = getIntervalInfo(makeExpr({ minute: '*/15' }));
    expect(runsPerDay(info)).toBe('~96 times per day');
  });

  it('calculates runs per day for 6-hour interval', () => {
    const info = getIntervalInfo(makeExpr({ minute: '0', hour: '*/6' }));
    expect(runsPerDay(info)).toBe('~4 times per day');
  });

  it('returns Variable for non-uniform', () => {
    const info = getIntervalInfo(makeExpr({ minute: '30', hour: '9' }));
    expect(runsPerDay(info)).toBe('Variable');
  });
});
