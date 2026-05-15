import { expandToken, expandFieldValues, FIELD_BOUNDS } from './rangeExpander';

describe('expandToken', () => {
  const minuteBounds = FIELD_BOUNDS.minute; // 0-59

  it('expands wildcard to full range', () => {
    expect(expandToken('*', minuteBounds)).toEqual(
      Array.from({ length: 60 }, (_, i) => i)
    );
  });

  it('expands a single value', () => {
    expect(expandToken('5', minuteBounds)).toEqual([5]);
  });

  it('expands a range', () => {
    expect(expandToken('2-5', minuteBounds)).toEqual([2, 3, 4, 5]);
  });

  it('expands wildcard with step', () => {
    expect(expandToken('*/15', minuteBounds)).toEqual([0, 15, 30, 45]);
  });

  it('expands range with step', () => {
    expect(expandToken('0-10/2', minuteBounds)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('throws on step < 1', () => {
    expect(() => expandToken('*/0', minuteBounds)).toThrow(RangeError);
  });

  it('throws on out-of-bounds range', () => {
    expect(() => expandToken('50-65', minuteBounds)).toThrow(RangeError);
  });

  it('throws on inverted range', () => {
    expect(() => expandToken('10-5', minuteBounds)).toThrow(RangeError);
  });

  it('throws on invalid token', () => {
    expect(() => expandToken('abc', minuteBounds)).toThrow(TypeError);
  });
});

describe('expandFieldValues', () => {
  it('expands a comma-separated list', () => {
    expect(expandFieldValues('1,3,5', 'minute')).toEqual([1, 3, 5]);
  });

  it('deduplicates overlapping ranges', () => {
    expect(expandFieldValues('0-5,3-8', 'minute')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('handles mixed tokens', () => {
    expect(expandFieldValues('0,*/30', 'minute')).toEqual([0, 30]);
  });

  it('expands dow field correctly', () => {
    expect(expandFieldValues('1-5', 'dow')).toEqual([1, 2, 3, 4, 5]);
  });

  it('expands month field with step', () => {
    expect(expandFieldValues('*/3', 'month')).toEqual([1, 4, 7, 10]);
  });

  it('returns sorted values', () => {
    expect(expandFieldValues('5,1,3', 'hour')).toEqual([1, 3, 5]);
  });
});
