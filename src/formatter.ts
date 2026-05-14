import { CronExpression } from './parser';
import { getNextRuns } from './nextRun';

export interface FormatOptions {
  /** Number of upcoming run timestamps to display */
  nextRunCount?: number;
  /** Reference date for computing next runs */
  from?: Date;
}

/**
 * Formats a parsed cron expression into a human-readable summary string
 * including the schedule label and the next upcoming run times.
 */
export function formatSummary(expr: CronExpression, options: FormatOptions = {}): string {
  const { nextRunCount = 5, from = new Date() } = options;

  const lines: string[] = [];

  lines.push(`Schedule : ${expr.label}`);
  lines.push(`Expression: ${expr.raw}`);
  lines.push('');
  lines.push(`Next ${nextRunCount} run(s):`);

  const runs = getNextRuns(expr, nextRunCount, from);

  if (runs.length === 0) {
    lines.push('  (no upcoming runs found)');
  } else {
    runs.forEach((date, i) => {
      lines.push(`  ${i + 1}. ${formatDate(date)}`);
    });
  }

  return lines.join('\n');
}

/**
 * Formats a Date object into a readable local date-time string.
 */
export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year  = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day   = pad(date.getDate());
  const hour  = pad(date.getHours());
  const min   = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hour}:${min}`;
}
