import { getNextRuns } from './nextRun';
import { formatDate } from './formatter';

export interface CompareEntry {
  expression: string;
  nextRuns: Date[];
  label?: string;
}

export interface CompareResult {
  entries: CompareEntry[];
  earliestNext: { expression: string; date: Date } | null;
}

export function compareNextRuns(
  expressions: string[],
  count: number = 3,
  timezone?: string
): CompareResult {
  const entries: CompareEntry[] = expressions.map((expr) => ({
    expression: expr,
    nextRuns: getNextRuns(expr, count, timezone),
  }));

  let earliestNext: { expression: string; date: Date } | null = null;

  for (const entry of entries) {
    if (entry.nextRuns.length === 0) continue;
    const first = entry.nextRuns[0];
    if (!earliestNext || first < earliestNext.date) {
      earliestNext = { expression: entry.expression, date: first };
    }
  }

  return { entries, earliestNext };
}

export function formatCompare(
  result: CompareResult,
  timezone?: string
): string {
  const lines: string[] = ['Next-run comparison:', ''];

  for (const entry of result.entries) {
    lines.push(`  ${entry.expression}:`);
    if (entry.nextRuns.length === 0) {
      lines.push('    (no upcoming runs)');
    } else {
      for (const run of entry.nextRuns) {
        lines.push(`    - ${formatDate(run, timezone)}`);
      }
    }
    lines.push('');
  }

  if (result.earliestNext) {
    lines.push(
      `Earliest next run: "${result.earliestNext.expression}" at ${formatDate(
        result.earliestNext.date,
        timezone
      )}`
    );
  }

  return lines.join('\n').trimEnd();
}
