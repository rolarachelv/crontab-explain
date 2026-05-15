import { parseCron } from './parser';
import { getNextRuns } from './nextRun';

export interface OverlapResult {
  expressionA: string;
  expressionB: string;
  overlaps: Date[];
  count: number;
}

/**
 * Find timestamps where two cron expressions would fire at the same minute
 * within the given lookahead window.
 */
export function findOverlaps(
  exprA: string,
  exprB: string,
  from: Date = new Date(),
  count: number = 50
): OverlapResult {
  const runsA = getNextRuns(parseCron(exprA), from, count);
  const runsB = getNextRuns(parseCron(exprB), from, count);

  const setA = new Set(runsA.map(normalizeToMinute));
  const overlaps: Date[] = [];

  for (const d of runsB) {
    const key = normalizeToMinute(d);
    if (setA.has(key)) {
      overlaps.push(new Date(key));
    }
  }

  // Deduplicate (both lists may contain the same minute multiple times)
  const unique = Array.from(new Map(overlaps.map(d => [d.getTime(), d])).values());
  unique.sort((a, b) => a.getTime() - b.getTime());

  return {
    expressionA: exprA,
    expressionB: exprB,
    overlaps: unique,
    count: unique.length,
  };
}

function normalizeToMinute(d: Date): number {
  const copy = new Date(d);
  copy.setSeconds(0, 0);
  return copy.getTime();
}

export function formatOverlap(result: OverlapResult): string {
  const lines: string[] = [
    `Overlap analysis:`,
    `  A: ${result.expressionA}`,
    `  B: ${result.expressionB}`,
    `  Overlapping runs (next ${result.count}):`,
  ];

  if (result.count === 0) {
    lines.push('    (none found in lookahead window)');
  } else {
    for (const d of result.overlaps) {
      lines.push(`    - ${d.toISOString()}`);
    }
  }

  return lines.join('\n');
}
