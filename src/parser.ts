export interface CronField {
  raw: string;
  values: number[];
  label: string;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function expandField(raw: string, min: number, max: number): number[] {
  if (raw === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const values = new Set<number>();

  for (const part of raw.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      const [rangeMin, rangeMax] = range === '*'
        ? [min, max]
        : range.split('-').map(Number);
      for (let i = rangeMin; i <= (rangeMax ?? max); i += step) {
        values.add(i);
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) values.add(i);
    } else {
      values.add(parseInt(part, 10));
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

function buildLabel(values: number[], min: number, max: number, names?: string[]): string {
  if (values.length === max - min + 1) return 'every';
  if (names) return values.map(v => names[v - min]).join(', ');
  return values.join(', ');
}

export function parseCron(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}`);
  }

  const [rawMinute, rawHour, rawDom, rawMonth, rawDow] = parts;

  const minuteValues = expandField(rawMinute, 0, 59);
  const hourValues = expandField(rawHour, 0, 23);
  const domValues = expandField(rawDom, 1, 31);
  const monthValues = expandField(rawMonth, 1, 12);
  const dowValues = expandField(rawDow, 0, 6);

  return {
    minute:     { raw: rawMinute, values: minuteValues, label: buildLabel(minuteValues, 0, 59) },
    hour:       { raw: rawHour,   values: hourValues,   label: buildLabel(hourValues, 0, 23) },
    dayOfMonth: { raw: rawDom,    values: domValues,    label: buildLabel(domValues, 1, 31) },
    month:      { raw: rawMonth,  values: monthValues,  label: buildLabel(monthValues, 1, 12, MONTH_NAMES) },
    dayOfWeek:  { raw: rawDow,    values: dowValues,    label: buildLabel(dowValues, 0, 6, DAY_NAMES) },
  };
}
