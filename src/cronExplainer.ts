import { parseCron } from './parser';
import { validateCron } from './validator';
import { describeAllFields } from './fieldDescription';
import { humanizeMinute, humanizeHour, humanizeDom, humanizeMonth, humanizeDow } from './humanizer';
import { CronExpression } from './types';

export interface ExplainerResult {
  expression: string;
  summary: string;
  fieldBreakdown: Record<string, string>;
  plain: string;
}

function buildSummary(parsed: CronExpression): string {
  const parts: string[] = [];

  const minute = humanizeMinute(parsed.minute);
  const hour = humanizeHour(parsed.hour);
  const dom = humanizeDom(parsed.dom);
  const month = humanizeMonth(parsed.month);
  const dow = humanizeDow(parsed.dow);

  parts.push(`At ${minute} past ${hour}`);

  if (dom !== 'every day' || dow !== 'every day of the week') {
    if (dom !== 'every day') parts.push(`on ${dom}`);
    if (dow !== 'every day of the week') parts.push(`on ${dow}`);
  }

  if (month !== 'every month') parts.push(`in ${month}`);

  return parts.join(', ') + '.';
}

export function explainCron(expression: string): ExplainerResult {
  const validation = validateCron(expression);
  if (!validation.valid) {
    throw new Error(`Invalid cron expression: ${validation.errors.join('; ')}`);
  }

  const parsed = parseCron(expression);
  const summary = buildSummary(parsed);
  const fieldBreakdown = describeAllFields(parsed);

  const plain = [
    `Expression : ${expression}`,
    `Summary    : ${summary}`,
    '',
    'Field Breakdown:',
    ...Object.entries(fieldBreakdown).map(([k, v]) => `  ${k.padEnd(10)}: ${v}`),
  ].join('\n');

  return { expression, summary, fieldBreakdown, plain };
}

export function formatExplainer(result: ExplainerResult): string {
  return result.plain;
}
