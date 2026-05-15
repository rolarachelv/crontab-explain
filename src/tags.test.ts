import { tagExpression, formatTag, CronTag } from './tags';
import { CronExpression } from './types';

function makeExpr(overrides: Partial<CronExpression> = {}): CronExpression {
  return {
    minute: '*',
    hour:   '*',
    dom:    '*',
    month:  '*',
    dow:    '*',
    raw:    '* * * * *',
    ...overrides,
  };
}

describe('tagExpression', () => {
  it('tags a yearly expression', () => {
    const result = tagExpression(makeExpr({ minute: '0', hour: '9', dom: '1', month: '1', raw: '0 9 1 1 *' }));
    expect(result.tag).toBe<CronTag>('yearly');
    expect(result.label).toBe('Yearly');
  });

  it('tags a monthly expression', () => {
    const result = tagExpression(makeExpr({ minute: '0', hour: '8', dom: '15', raw: '0 8 15 * *' }));
    expect(result.tag).toBe<CronTag>('monthly');
  });

  it('tags a weekly expression', () => {
    const result = tagExpression(makeExpr({ minute: '30', hour: '10', dow: '1', raw: '30 10 * * 1' }));
    expect(result.tag).toBe<CronTag>('weekly');
  });

  it('tags a daily expression', () => {
    const result = tagExpression(makeExpr({ minute: '0', hour: '6', raw: '0 6 * * *' }));
    expect(result.tag).toBe<CronTag>('daily');
  });

  it('tags an hourly expression', () => {
    const result = tagExpression(makeExpr({ minute: '0', raw: '0 * * * *' }));
    expect(result.tag).toBe<CronTag>('hourly');
  });

  it('tags a frequent expression (*/5)', () => {
    const result = tagExpression(makeExpr({ minute: '*/5', raw: '*/5 * * * *' }));
    expect(result.tag).toBe<CronTag>('frequent');
    expect(result.description).toMatch(/multiple times/i);
  });

  it('tags a frequent expression (*/15)', () => {
    const result = tagExpression(makeExpr({ minute: '*/15', raw: '*/15 * * * *' }));
    expect(result.tag).toBe<CronTag>('frequent');
  });

  it('falls back to custom for complex expressions', () => {
    const result = tagExpression(makeExpr({ minute: '5,10,20', hour: '*/3', raw: '5,10,20 */3 * * *' }));
    expect(result.tag).toBe<CronTag>('custom');
  });
});

describe('formatTag', () => {
  it('returns a formatted string', () => {
    const result = tagExpression(makeExpr({ minute: '0', hour: '6', raw: '0 6 * * *' }));
    const str = formatTag(result);
    expect(str).toBe('[Daily] Runs once per day');
  });
});
