import { buildIntervalSummary, formatIntervalSummary } from './intervalFormatter';
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

describe('buildIntervalSummary', () => {
  it('returns isInterval true for */30 minute pattern', () => {
    const result = buildIntervalSummary(makeExpr({ minute: '*/30' }));
    expect(result.isInterval).toBe(true);
    expect(result.intervalMinutes).toBe(30);
    expect(result.intervalHours).toBeNull();
    expect(result.description).toBe('Every 30 minutes');
  });

  it('returns isInterval true for hourly step pattern', () => {
    const result = buildIntervalSummary(makeExpr({ minute: '0', hour: '*/4' }));
    expect(result.isInterval).toBe(true);
    expect(result.intervalHours).toBe(4);
    expect(result.intervalMinutes).toBe(240);
  });

  it('returns isInterval false for non-interval', () => {
    const result = buildIntervalSummary(makeExpr({ minute: '0', hour: '8', dom: '1' }));
    expect(result.isInterval).toBe(false);
    expect(result.intervalMinutes).toBeNull();
  });

  it('includes runsPerDay', () => {
    const result = buildIntervalSummary(makeExpr({ minute: '*/10' }));
    expect(result.runsPerDay).toBe('~144 times per day');
  });
});

describe('formatIntervalSummary', () => {
  it('formats a fixed interval expression', () => {
    const output = formatIntervalSummary(makeExpr({ minute: '*/15' }));
    expect(output).toContain('Fixed');
    expect(output).toContain('Every 15 minutes');
    expect(output).toContain('15 minute(s)');
    expect(output).toContain('~96 times per day');
  });

  it('formats a non-fixed expression', () => {
    const output = formatIntervalSummary(makeExpr({ minute: '0', hour: '9' }));
    expect(output).toContain('Non-fixed');
    expect(output).toContain('Non-uniform interval');
    expect(output).toContain('Variable');
    expect(output).not.toContain('minute(s)');
  });

  it('includes hour info for hourly step', () => {
    const output = formatIntervalSummary(makeExpr({ minute: '0', hour: '*/3' }));
    expect(output).toContain('3 hour(s)');
    expect(output).toContain('180 minute(s)');
  });
});
