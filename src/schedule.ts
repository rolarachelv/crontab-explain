import { CronExpression, ScheduleSummary } from './types';
import { parseCron } from './parser';
import { getNextRuns } from './nextRun';
import { formatSummary, formatDate } from './formatter';
import { validateCron } from './validator';
import { resolveAlias } from './aliases';
import { resolvePreset } from './presets';
import { isValidTimezone, formatInTimezone } from './timezone';

export interface ScheduleOptions {
  count?: number;
  timezone?: string;
  verbose?: boolean;
}

export interface ScheduleResult {
  expression: string;
  summary: string;
  nextRuns: string[];
  timezone: string;
  isValid: boolean;
  error?: string;
}

export function buildScheduleResult(
  raw: string,
  options: ScheduleOptions = {}
): ScheduleResult {
  const { count = 5, timezone = 'UTC', verbose = false } = options;

  if (!isValidTimezone(timezone)) {
    return {
      expression: raw,
      summary: '',
      nextRuns: [],
      timezone,
      isValid: false,
      error: `Invalid timezone: "${timezone}"`
    };
  }

  const resolved = resolvePreset(raw) ?? resolveAlias(raw) ?? raw;

  const validation = validateCron(resolved);
  if (!validation.valid) {
    return {
      expression: resolved,
      summary: '',
      nextRuns: [],
      timezone,
      isValid: false,
      error: validation.error
    };
  }

  const parsed: CronExpression = parseCron(resolved);
  const summary = formatSummary(parsed);
  const runs = getNextRuns(parsed, count);
  const nextRuns = runs.map(date =>
    timezone === 'UTC' ? formatDate(date) : formatInTimezone(date, timezone)
  );

  return {
    expression: resolved,
    summary,
    nextRuns,
    timezone,
    isValid: true
  };
}

export function renderScheduleResult(
  result: ScheduleResult,
  verbose = false
): string {
  if (!result.isValid) {
    return `Error: ${result.error}`;
  }

  const lines: string[] = [
    `Expression : ${result.expression}`,
    `Schedule   : ${result.summary}`,
    `Timezone   : ${result.timezone}`,
    `Next runs  :`
  ];

  result.nextRuns.forEach((run, i) => {
    lines.push(`  ${i + 1}. ${run}`);
  });

  return lines.join('\n');
}
