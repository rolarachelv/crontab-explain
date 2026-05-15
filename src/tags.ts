/**
 * Tags module: categorize cron expressions with descriptive labels
 * e.g. 'frequent', 'daily', 'weekly', 'monthly', 'yearly', 'custom'
 */

import { CronExpression } from './types';

export type CronTag =
  | 'frequent'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export interface TagResult {
  tag: CronTag;
  label: string;
  description: string;
}

const TAG_META: Record<CronTag, { label: string; description: string }> = {
  frequent:    { label: 'Frequent',    description: 'Runs multiple times per hour' },
  hourly:      { label: 'Hourly',      description: 'Runs once per hour' },
  daily:       { label: 'Daily',       description: 'Runs once per day' },
  weekly:      { label: 'Weekly',      description: 'Runs once per week' },
  monthly:     { label: 'Monthly',     description: 'Runs once per month' },
  yearly:      { label: 'Yearly',      description: 'Runs once per year' },
  custom:      { label: 'Custom',      description: 'Custom schedule' },
};

/**
 * Determine a CronTag from a parsed CronExpression.
 */
export function tagExpression(expr: CronExpression): TagResult {
  const { minute, hour, dom, month, dow } = expr;

  const isWildcard = (v: string) => v === '*';
  const isFixed    = (v: string) => /^\d+$/.test(v);

  let tag: CronTag = 'custom';

  if (isFixed(month) && isFixed(dom) && isFixed(hour) && isFixed(minute)) {
    tag = 'yearly';
  } else if (isFixed(dom) && isFixed(hour) && isFixed(minute) && isWildcard(month)) {
    tag = 'monthly';
  } else if (isFixed(dow) && isFixed(hour) && isFixed(minute)) {
    tag = 'weekly';
  } else if (isWildcard(dom) && isWildcard(dow) && isFixed(hour) && isFixed(minute) && isWildcard(month)) {
    tag = 'daily';
  } else if (isWildcard(dom) && isWildcard(dow) && isWildcard(hour) && isFixed(minute) && isWildcard(month)) {
    tag = 'hourly';
  } else if (isWildcard(dom) && isWildcard(dow) && isWildcard(hour) && isWildcard(month)) {
    // minute is something like */5, */15, etc.
    const stepMatch = minute.match(/^\*\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[1], 10);
      if (step < 60) tag = 'frequent';
    }
  }

  return { tag, ...TAG_META[tag] };
}

/**
 * Return a formatted string for display.
 */
export function formatTag(result: TagResult): string {
  return `[${result.label}] ${result.description}`;
}
