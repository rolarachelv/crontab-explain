import { validateCron } from './validator';

describe('validateCron', () => {
  it('accepts a valid standard expression', () => {
    const result = validateCron('0 9 * * 1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects expression with wrong number of fields', () => {
    const result = validateCron('0 9 * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Expected 5 fields/);
  });

  it('rejects out-of-range minute', () => {
    const result = validateCron('60 9 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Minute'))).toBe(true);
  });

  it('rejects out-of-range hour', () => {
    const result = validateCron('0 24 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Hour'))).toBe(true);
  });

  it('rejects invalid step value', () => {
    const result = validateCron('*/0 * * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('step'))).toBe(true);
  });

  it('rejects inverted range', () => {
    const result = validateCron('0 9 15-5 * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('greater than end'))).toBe(true);
  });

  it('accepts wildcard with step', () => {
    const result = validateCron('*/15 */2 * * *');
    expect(result.valid).toBe(true);
  });

  it('accepts comma-separated values', () => {
    const result = validateCron('0 9,17 * * 1,2,3');
    expect(result.valid).toBe(true);
  });

  it('rejects month value out of range', () => {
    const result = validateCron('0 9 1 13 *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Month'))).toBe(true);
  });

  it('accepts day-of-week value 7 (Sunday alias)', () => {
    const result = validateCron('0 0 * * 7');
    expect(result.valid).toBe(true);
  });
});
