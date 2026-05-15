/**
 * canonicalMap.ts
 * Builds a map of canonical -> original expressions from a list,
 * useful for deduplicating cron expressions across a crontab.
 */

import { normalizeCron } from './cronNormalizer';
import { CronError } from './errors';

export interface CanonicalEntry {
  canonical: string;
  originals: string[];
  isDuplicate: boolean;
}

export interface CanonicalMapResult {
  entries: CanonicalEntry[];
  duplicates: CanonicalEntry[];
  uniqueCount: number;
  totalCount: number;
}

/**
 * Given a list of cron expressions, group them by their canonical form.
 */
export function buildCanonicalMap(expressions: string[]): CanonicalMapResult {
  const map = new Map<string, string[]>();
  const errors: string[] = [];

  for (const expr of expressions) {
    try {
      const { normalized } = normalizeCron(expr);
      const existing = map.get(normalized) ?? [];
      existing.push(expr);
      map.set(normalized, existing);
    } catch (e) {
      if (e instanceof Error) errors.push(`"${expr}": ${e.message}`);
    }
  }

  if (errors.length > 0) {
    throw new CronError(`Invalid expressions:\n${errors.join('\n')}`);
  }

  const entries: CanonicalEntry[] = [];
  for (const [canonical, originals] of map.entries()) {
    entries.push({
      canonical,
      originals,
      isDuplicate: originals.length > 1,
    });
  }

  const duplicates = entries.filter(e => e.isDuplicate);

  return {
    entries,
    duplicates,
    uniqueCount: entries.length,
    totalCount: expressions.length,
  };
}

/**
 * Format a CanonicalMapResult for terminal output.
 */
export function formatCanonicalMap(result: CanonicalMapResult): string {
  const lines: string[] = [
    `Total: ${result.totalCount} | Unique: ${result.uniqueCount} | Duplicates: ${result.duplicates.length}`,
    '',
  ];

  for (const entry of result.entries) {
    const tag = entry.isDuplicate ? '[DUP]' : '     ';
    lines.push(`${tag} ${entry.canonical}`);
    if (entry.originals.length > 1 || entry.originals[0] !== entry.canonical) {
      entry.originals.forEach(o => lines.push(`       ← ${o}`));
    }
  }

  return lines.join('\n');
}
