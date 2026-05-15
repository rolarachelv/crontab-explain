import { CronExpression, ScheduleResult } from './types';
import { parseCron } from './parser';
import { matchField } from './nextRun';

/**
 * Returns the N most recent past run timestamps before a given date.
 */
export function getPastRuns(
  expr: CronExpression,
  count: number = 5,
  before: Date = new Date()
): Date[] {
  const results: Date[] = [];
  const cursor = new Date(before);
  // Step back one minute to exclude 'before' itself
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() - 1);

  let iterations = 0;
  const maxIterations = 60 * 24 * 366; // up to ~1 year back

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    const min = cursor.getMinutes();
    const hour = cursor.getHours();
    const dom = cursor.getDate();
    const month = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      matchField(expr.minute, min, 0, 59) &&
      matchField(expr.hour, hour, 0, 23) &&
      matchField(expr.dom, dom, 1, 31) &&
      matchField(expr.month, month, 1, 12) &&
      matchField(expr.dow, dow, 0, 6)
    ) {
      results.push(new Date(cursor));
    }

    cursor.setMinutes(cursor.getMinutes() - 1);
  }

  return results;
}

/**
 * Formats a list of past run dates into a human-readable history block.
 */
export function formatHistory(dates: Date[], timezone?: string): string {
  if (dates.length === 0) {
    return 'No past runs found within the search window.';
  }

  const lines = dates.map((d, i) => {
    const label = timezone
      ? d.toLocaleString('en-US', { timeZone: timezone })
      : d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    return `  ${i + 1}. ${label}`;
  });

  return `Last ${dates.length} run(s):\n${lines.join('\n')}`;
}
