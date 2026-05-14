import { CronExpression, ScheduleResult } from './types';
import { parseCron } from './parser';
import { buildScheduleResult } from './schedule';

export interface DiffEntry {
  field: 'minute' | 'hour' | 'dom' | 'month' | 'dow';
  label: string;
  from: string;
  to: string;
}

export interface CronDiff {
  expressionA: string;
  expressionB: string;
  changes: DiffEntry[];
  identical: boolean;
  summaryA: string;
  summaryB: string;
}

const FIELD_LABELS: Record<string, string> = {
  minute: 'Minute',
  hour: 'Hour',
  dom: 'Day of Month',
  month: 'Month',
  dow: 'Day of Week',
};

export function diffCrons(expressionA: string, expressionB: string): CronDiff {
  const parsedA: CronExpression = parseCron(expressionA);
  const parsedB: CronExpression = parseCron(expressionB);

  const fields: Array<keyof CronExpression> = ['minute', 'hour', 'dom', 'month', 'dow'];
  const changes: DiffEntry[] = [];

  for (const field of fields) {
    const valA = parsedA[field];
    const valB = parsedB[field];
    const rawA = JSON.stringify(valA);
    const rawB = JSON.stringify(valB);
    if (rawA !== rawB) {
      changes.push({
        field: field as DiffEntry['field'],
        label: FIELD_LABELS[field],
        from: Array.isArray(valA) ? valA.join(', ') : String(valA),
        to: Array.isArray(valB) ? valB.join(', ') : String(valB),
      });
    }
  }

  const resultA: ScheduleResult = buildScheduleResult(expressionA);
  const resultB: ScheduleResult = buildScheduleResult(expressionB);

  return {
    expressionA,
    expressionB,
    changes,
    identical: changes.length === 0,
    summaryA: resultA.summary,
    summaryB: resultB.summary,
  };
}

export function formatDiff(diff: CronDiff): string {
  if (diff.identical) {
    return `Expressions are identical:\n  ${diff.expressionA}`;
  }

  const lines: string[] = [
    `Diff: "${diff.expressionA}" → "${diff.expressionB}"`,
    `  A: ${diff.summaryA}`,
    `  B: ${diff.summaryB}`,
    '',
    'Changes:',
  ];

  for (const change of diff.changes) {
    lines.push(`  ${change.label}: [${change.from}] → [${change.to}]`);
  }

  return lines.join('\n');
}
