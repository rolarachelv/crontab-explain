import { buildScheduleResult, renderScheduleResult } from './schedule';

describe('buildScheduleResult', () => {
  it('returns a valid result for a standard cron expression', () => {
    const result = buildScheduleResult('0 9 * * 1-5');
    expect(result.isValid).toBe(true);
    expect(result.expression).toBe('0 9 * * 1-5');
    expect(result.summary).toBeTruthy();
    expect(result.nextRuns).toHaveLength(5);
    expect(result.timezone).toBe('UTC');
  });

  it('respects the count option', () => {
    const result = buildScheduleResult('*/15 * * * *', { count: 3 });
    expect(result.isValid).toBe(true);
    expect(result.nextRuns).toHaveLength(3);
  });

  it('returns error for invalid expression', () => {
    const result = buildScheduleResult('99 99 99 99 99');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.nextRuns).toHaveLength(0);
  });

  it('returns error for invalid timezone', () => {
    const result = buildScheduleResult('0 9 * * *', { timezone: 'Not/AZone' });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid timezone/);
  });

  it('resolves preset expressions like @daily', () => {
    const result = buildScheduleResult('@daily');
    expect(result.isValid).toBe(true);
    expect(result.expression).not.toBe('@daily');
  });

  it('resolves alias expressions like @midnight', () => {
    const result = buildScheduleResult('@midnight');
    expect(result.isValid).toBe(true);
  });

  it('uses provided timezone in output', () => {
    const result = buildScheduleResult('0 12 * * *', { timezone: 'America/New_York' });
    expect(result.isValid).toBe(true);
    expect(result.timezone).toBe('America/New_York');
  });
});

describe('renderScheduleResult', () => {
  it('renders a valid result as a formatted string', () => {
    const result = buildScheduleResult('0 0 * * *', { count: 2 });
    const output = renderScheduleResult(result);
    expect(output).toContain('Expression');
    expect(output).toContain('Schedule');
    expect(output).toContain('Next runs');
    expect(output).toContain('1.');
    expect(output).toContain('2.');
  });

  it('renders an error message for invalid result', () => {
    const result = buildScheduleResult('bad expression');
    const output = renderScheduleResult(result);
    expect(output).toMatch(/^Error:/);
  });
});
