import { CronExpression } from './types';

export interface IntervalInfo {
  hasFixedInterval: boolean;
  intervalMinutes: number | null;
  intervalHours: number | null;
  description: string;
}

/**
 * Attempts to determine if a cron expression represents a simple repeating interval.
 * e.g. "*/15 * * * *" => every 15 minutes
 */
export function getIntervalInfo(expr: CronExpression): IntervalInfo {
  const { minute, hour, dom, month, dow } = expr;

  const isEveryDom = dom === '*';
  const isEveryMonth = month === '*';
  const isEveryDow = dow === '*';

  // Every N minutes: "*/N * * * *"
  if (
    isEveryDom &&
    isEveryMonth &&
    isEveryDow &&
    hour === '*' &&
    /^\*\/\d+$/.test(minute)
  ) {
    const n = parseInt(minute.split('/')[1], 10);
    if (n > 0 && n < 60) {
      return {
        hasFixedInterval: true,
        intervalMinutes: n,
        intervalHours: null,
        description: `Every ${n} minute${n !== 1 ? 's' : ''}`,
      };
    }
  }

  // Every N hours: "0 */N * * *"
  if (
    isEveryDom &&
    isEveryMonth &&
    isEveryDow &&
    minute === '0' &&
    /^\*\/\d+$/.test(hour)
  ) {
    const n = parseInt(hour.split('/')[1], 10);
    if (n > 0 && n < 24) {
      return {
        hasFixedInterval: true,
        intervalMinutes: n * 60,
        intervalHours: n,
        description: `Every ${n} hour${n !== 1 ? 's' : ''}`,
      };
    }
  }

  return {
    hasFixedInterval: false,
    intervalMinutes: null,
    intervalHours: null,
    description: 'Non-uniform interval',
  };
}

/**
 * Returns a human-readable string for how often the cron fires per day (approx).
 */
export function runsPerDay(info: IntervalInfo): string {
  if (!info.hasFixedInterval || info.intervalMinutes === null) {
    return 'Variable';
  }
  const times = Math.floor(1440 / info.intervalMinutes);
  return `~${times} time${times !== 1 ? 's' : ''} per day`;
}
