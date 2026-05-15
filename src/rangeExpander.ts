/**
 * rangeExpander.ts
 * Utility for expanding cron field ranges into sorted arrays of concrete values,
 * with support for step expressions and named aliases.
 */

import { CronField } from './types';

export interface FieldBounds {
  min: number;
  max: number;
}

export const FIELD_BOUNDS: Record<CronField, FieldBounds> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dom: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dow: { min: 0, max: 6 },
};

/**
 * Expand a single cron token (e.g. "1-5/2", "*/3", "4") into a sorted
 * array of numeric values within the given bounds.
 */
export function expandToken(token: string, bounds: FieldBounds): number[] {
  const { min, max } = bounds;

  // Step expression
  const stepMatch = token.match(/^(.+)\/([0-9]+)$/);
  let step = 1;
  let rangeToken = token;
  if (stepMatch) {
    rangeToken = stepMatch[1];
    step = parseInt(stepMatch[2], 10);
    if (step < 1) throw new RangeError(`Step must be >= 1, got ${step}`);
  }

  let start: number;
  let end: number;

  if (rangeToken === '*') {
    start = min;
    end = max;
  } else if (rangeToken.includes('-')) {
    const [lo, hi] = rangeToken.split('-').map(Number);
    start = lo;
    end = hi;
  } else {
    const val = Number(rangeToken);
    if (isNaN(val)) throw new TypeError(`Invalid token value: "${rangeToken}"`);
    start = val;
    end = val;
  }

  if (start < min || end > max || start > end) {
    throw new RangeError(
      `Range ${start}-${end} out of bounds [${min}-${max}]`
    );
  }

  const values: number[] = [];
  for (let v = start; v <= end; v += step) {
    values.push(v);
  }
  return values;
}

/**
 * Expand a full cron field expression (may contain commas) into a sorted,
 * deduplicated array of values.
 */
export function expandFieldValues(expression: string, field: CronField): number[] {
  const bounds = FIELD_BOUNDS[field];
  const tokens = expression.split(',');
  const set = new Set<number>();
  for (const token of tokens) {
    for (const v of expandToken(token.trim(), bounds)) {
      set.add(v);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
