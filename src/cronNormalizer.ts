/**
 * cronNormalizer.ts
 * Normalizes cron expressions to a canonical form,
 * resolving aliases, presets, and collapsing redundant wildcards.
 */

import { resolveAlias } from './aliases';
import { resolvePreset, isPreset } from './presets';
import { validateCron } from './validator';

export interface NormalizeResult {
  original: string;
  normalized: string;
  changes: string[];
}

/**
 * Collapse a field value to '*' if it covers the full range.
 */
export function collapseFullRange(
  field: string,
  min: number,
  max: number
): string {
  if (field === '*' || field === '*/1') return '*';
  // e.g. "0-59" for minutes -> "*"
  const fullRange = new RegExp(`^${min}-${max}$`);
  if (fullRange.test(field)) return '*';
  return field;
}

/**
 * Normalize a single cron expression to its canonical form.
 */
export function normalizeCron(expr: string): NormalizeResult {
  const changes: string[] = [];
  let working = expr.trim();

  // Resolve preset (@daily, @weekly, etc.)
  if (isPreset(working)) {
    const resolved = resolvePreset(working);
    changes.push(`Expanded preset "${working}" to "${resolved}"`);
    working = resolved;
  }

  // Resolve named aliases (e.g. JAN, MON)
  const aliased = resolveAlias(working);
  if (aliased !== working) {
    changes.push(`Resolved aliases in "${working}" to "${aliased}"`);
    working = aliased;
  }

  const parts = working.split(/\s+/);
  if (parts.length !== 5) {
    return { original: expr, normalized: working, changes };
  }

  const [minute, hour, dom, month, dow] = parts;
  const ranges = [
    { field: minute, min: 0, max: 59 },
    { field: hour,   min: 0, max: 23 },
    { field: dom,    min: 1, max: 31 },
    { field: month,  min: 1, max: 12 },
    { field: dow,    min: 0, max: 7  },
  ];

  const normalized = ranges
    .map(({ field, min, max }) => collapseFullRange(field, min, max))
    .join(' ');

  if (normalized !== working) {
    changes.push(`Collapsed full-range fields in "${working}" to "${normalized}"`);
  }

  validateCron(normalized); // throws CronError if invalid

  return { original: expr, normalized, changes };
}

/**
 * Format a NormalizeResult for terminal output.
 */
export function formatNormalize(result: NormalizeResult): string {
  const lines: string[] = [
    `Original  : ${result.original}`,
    `Normalized: ${result.normalized}`,
  ];
  if (result.changes.length > 0) {
    lines.push('Changes:');
    result.changes.forEach(c => lines.push(`  • ${c}`));
  } else {
    lines.push('No changes — expression is already canonical.');
  }
  return lines.join('\n');
}
