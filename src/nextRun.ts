import { CronExpression } from './parser';

/**
 * Given a parsed cron expression and a reference date, compute the next
 * N timestamps that match the schedule.
 */
export function getNextRuns(expr: CronExpression, count: number = 5, from: Date = new Date()): Date[] {
  const results: Date[] = [];
  const cursor = new Date(from);

  // Advance past the current second so we don't return "now"
  cursor.setSeconds(cursor.getSeconds() + 1);
  cursor.setMilliseconds(0);

  const limit = 100_000; // guard against infinite loops
  let iterations = 0;

  while (results.length < count && iterations < limit) {
    iterations++;

    if (!matchField(expr.minute, cursor.getMinutes(), 0, 59)) {
      cursor.setMinutes(cursor.getMinutes() + 1);
      cursor.setSeconds(0);
      continue;
    }

    if (!matchField(expr.hour, cursor.getHours(), 0, 23)) {
      cursor.setHours(cursor.getHours() + 1);
      cursor.setMinutes(0);
      cursor.setSeconds(0);
      continue;
    }

    if (!matchField(expr.dayOfMonth, cursor.getDate(), 1, 31)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0);
      cursor.setMinutes(0);
      cursor.setSeconds(0);
      continue;
    }

    if (!matchField(expr.month, cursor.getMonth() + 1, 1, 12)) {
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
      cursor.setHours(0);
      cursor.setMinutes(0);
      cursor.setSeconds(0);
      continue;
    }

    if (!matchField(expr.dayOfWeek, cursor.getDay(), 0, 6)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0);
      cursor.setMinutes(0);
      cursor.setSeconds(0);
      continue;
    }

    results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
    cursor.setSeconds(0);
  }

  return results;
}

function matchField(values: number[], value: number, _min: number, _max: number): boolean {
  return values.includes(value);
}
