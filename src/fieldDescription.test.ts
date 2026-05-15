import { describeField, describeAllFields } from './fieldDescription';

describe('describeField', () => {
  test('wildcard returns "every <field>"', () => {
    expect(describeField('*', 'minute')).toBe('every minute');
    expect(describeField('*', 'hour')).toBe('every hour');
  });

  test('single value', () => {
    expect(describeField('5', 'minute')).toBe('minute 5');
    expect(describeField('3', 'month')).toBe('month Mar');
    expect(describeField('1', 'dow')).toBe('dow Mon');
  });

  test('list of values (≤4)', () => {
    expect(describeField('1,2,3', 'dow')).toBe('dows Mon, Tue, Wed');
    expect(describeField('1,6', 'month')).toBe('months Jan, Jun');
  });

  test('list of values (>4) is truncated', () => {
    const result = describeField('1,2,3,4,5', 'hour');
    expect(result).toContain('(5 total)');
    expect(result).toContain('…');
  });

  test('uniform step pattern', () => {
    expect(describeField('*/5', 'minute')).toBe('every 5 minutes');
    expect(describeField('*/2', 'hour')).toBe('every 2 hours');
  });

  test('range expands correctly', () => {
    const result = describeField('1-3', 'month');
    expect(result).toBe('months Jan, Feb, Mar');
  });

  test('no valid field for out-of-range', () => {
    // expandField with impossible range returns empty
    const result = describeField('99', 'minute');
    // 99 > 59, expandField should return empty
    expect(result).toBe('no valid minute');
  });
});

describe('describeAllFields', () => {
  test('maps each part to its field description', () => {
    const parts = ['*/5', '2', '*', '1', '1-5'];
    const result = describeAllFields(parts);
    expect(result.minute).toBe('every 5 minutes');
    expect(result.hour).toBe('hour 2');
    expect(result.dom).toBe('every dom');
    expect(result.month).toBe('month Jan');
    expect(result.dow).toContain('dow');
  });

  test('defaults missing parts to wildcard', () => {
    const result = describeAllFields(['0']);
    expect(result.hour).toBe('every hour');
    expect(result.dom).toBe('every dom');
  });
});
