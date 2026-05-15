import { CronExpression } from './types';
import { getIntervalInfo, runsPerDay, IntervalInfo } from './interval';

export interface IntervalSummary {
  isInterval: boolean;
  description: string;
  runsPerDay: string;
  intervalMinutes: number | null;
  intervalHours: number | null;
}

/**
 * Builds a structured summary of interval information for a cron expression.
 */
export function buildIntervalSummary(expr: CronExpression): IntervalSummary {
  const info: IntervalInfo = getIntervalInfo(expr);
  return {
    isInterval: info.hasFixedInterval,
    description: info.description,
    runsPerDay: runsPerDay(info),
    intervalMinutes: info.intervalMinutes,
    intervalHours: info.intervalHours,
  };
}

/**
 * Formats an interval summary as a human-readable multi-line string.
 */
export function formatIntervalSummary(expr: CronExpression): string {
  const summary = buildIntervalSummary(expr);
  const lines: string[] = [];

  lines.push(`Interval type : ${summary.isInterval ? 'Fixed' : 'Non-fixed'}`);
  lines.push(`Description   : ${summary.description}`);

  if (summary.intervalMinutes !== null) {
    lines.push(`Interval      : ${summary.intervalMinutes} minute(s)`);
  }
  if (summary.intervalHours !== null) {
    lines.push(`              : ${summary.intervalHours} hour(s)`);
  }

  lines.push(`Frequency     : ${summary.runsPerDay}`);

  return lines.join('\n');
}
