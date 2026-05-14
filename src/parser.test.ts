import { parseCron, ParsedCron } from './parser';

describe('parseCron', () => {
  test('throws on invalid field count', () => {
    expect(() => parseCron('* * * *')).toThrow('expected 5 fields, got 4');
    expect(() => parseCron('* * * * * *')).toThrow('expected 5 fields, got 6');
  });

  test('parses wildcard expression correctly', () => {
    const result = parseCron('* * * * *');
    expect(result.minute.values).toHaveLength(60);
    expect(result.hour.values).toHaveLength(24);
    expect(result.minute.label).toBe('every');
    expect(result.hour.label).toBe('every');
  });

  test('parses specific values', () => {
    const result = parseCron('30 9 * * *');
    expect(result.minute.values).toEqual([30]);
    expect(result.hour.values).toEqual([9]);
    expect(result.minute.label).toBe('30');
    expect(result.hour.label).toBe('9');
  });

  test('parses comma-separated values', () => {
    const result = parseCron('0 8,12,18 * * *');
    expect(result.hour.values).toEqual([8, 12, 18]);
    expect(result.hour.label).toBe('8, 12, 18');
  });

  test('parses range values', () => {
    const result = parseCron('0 9-17 * * 1-5');
    expect(result.hour.values).toEqual([9,10,11,12,13,14,15,16,17]);
    expect(result.dayOfWeek.values).toEqual([1,2,3,4,5]);
    expect(result.dayOfWeek.label).toBe('Monday, Tuesday, Wednesday, Thursday, Friday');
  });

  test('parses step values', () => {
    const result = parseCron('*/15 * * * *');
    expect(result.minute.values).toEqual([0, 15, 30, 45]);
  });

  test('parses step values with range', () => {
    const result = parseCron('0 0/6 * * *');
    expect(result.hour.values).toEqual([0, 6, 12, 18]);
  });

  test('parses month names as numbers', () => {
    const result = parseCron('0 0 1 1,6,12 *');
    expect(result.month.values).toEqual([1, 6, 12]);
    expect(result.month.label).toBe('January, June, December');
  });

  test('returns "every" label for full range', () => {
    const result: ParsedCron = parseCron('* * * * *');
    expect(result.dayOfMonth.label).toBe('every');
    expect(result.month.label).toBe('every');
    expect(result.dayOfWeek.label).toBe('every');
  });
});
