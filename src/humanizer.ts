/**
 * Converts parsed cron fields into human-readable English descriptions.
 */

import { CronParsed } from './types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function humanizeMinute(values: number[]): string {
  if (values.length === 60) return 'every minute';
  if (values.length === 1) return `minute ${values[0]}`;
  return `minutes ${values.join(', ')}`;
}

function humanizeHour(values: number[]): string {
  if (values.length === 24) return 'every hour';
  if (values.length === 1) {
    const h = values[0];
    const suffix = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:00 ${suffix}`;
  }
  return `hours ${values.join(', ')}`;
}

function humanizeDom(values: number[]): string {
  if (values.length === 31) return 'every day';
  if (values.length === 1) return `the ${ordinal(values[0])}`;
  return `days ${values.map(ordinal).join(', ')}`;
}

function humanizeMonth(values: number[]): string {
  if (values.length === 12) return 'every month';
  return values.map(m => MONTH_NAMES[m - 1]).join(', ');
}

function humanizeDow(values: number[]): string {
  if (values.length === 7) return 'every day of the week';
  return values.map(d => WEEKDAY_NAMES[d]).join(', ');
}

export function humanizeCron(parsed: CronParsed): string {
  const { minute, hour, dom, month, dow } = parsed;

  const minutePart = humanizeMinute(minute);
  const hourPart = humanizeHour(hour);
  const domPart = humanizeDom(dom);
  const monthPart = humanizeMonth(month);
  const dowPart = humanizeDow(dow);

  const allDom = dom.length === 31;
  const allDow = dow.length === 7;
  const allMonth = month.length === 12;

  let timePart = hour.length === 24
    ? `At ${minutePart}`
    : `At ${minutePart} past ${hourPart}`;

  let datePart = '';
  if (!allDom && !allDow) {
    datePart = `, on ${domPart} and on ${dowPart}`;
  } else if (!allDom) {
    datePart = `, on ${domPart} of the month`;
  } else if (!allDow) {
    datePart = `, on ${dowPart}`;
  } else {
    datePart = allDom ? '' : `, on ${domPart}`;
  }

  const monthSuffix = allMonth ? '' : ` in ${monthPart}`;

  return `${timePart}${datePart}${monthSuffix}.`;
}
