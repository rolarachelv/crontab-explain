import { humanizeCron } from './humanizer';
import { CronParsed } from './types';

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

const everyMinute: CronParsed = {
  minute: range(0, 59),
  hour: range(0, 23),
  dom: range(1, 31),
  month: range(1, 12),
  dow: range(0, 6),
  raw: '* * * * *',
};

describe('humanizeCron', () => {
  it('describes a wildcard expression as running every minute', () => {
    const result = humanizeCron(everyMinute);
    expect(result).toContain('every minute');
  });

  it('describes a specific time correctly', () => {
    const parsed: CronParsed = {
      ...everyMinute,
      minute: [30],
      hour: [9],
      raw: '30 9 * * *',
    };
    const result = humanizeCron(parsed);
    expect(result).toContain('minute 30');
    expect(result).toContain('9:00 AM');
  });

  it('describes a specific weekday', () => {
    const parsed: CronParsed = {
      ...everyMinute,
      dow: [1],
      raw: '* * * * 1',
    };
    const result = humanizeCron(parsed);
    expect(result).toContain('Monday');
  });

  it('describes specific months', () => {
    const parsed: CronParsed = {
      ...everyMinute,
      month: [3, 6, 9, 12],
      raw: '* * * 3,6,9,12 *',
    };
    const result = humanizeCron(parsed);
    expect(result).toContain('March');
    expect(result).toContain('December');
  });

  it('describes a specific day of month with ordinal', () => {
    const parsed: CronParsed = {
      ...everyMinute,
      dom: [1],
      raw: '* * 1 * *',
    };
    const result = humanizeCron(parsed);
    expect(result).toContain('1st');
  });

  it('handles PM hours correctly', () => {
    const parsed: CronParsed = {
      ...everyMinute,
      minute: [0],
      hour: [15],
      raw: '0 15 * * *',
    };
    const result = humanizeCron(parsed);
    expect(result).toContain('3:00 PM');
  });
});
