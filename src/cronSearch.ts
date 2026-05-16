import { parseCron } from './parser';
import { getNextRuns } from './nextRun';
import { CronExpression } from './types';

export interface SearchOptions {
  withinMinutes?: number;
  maxResults?: number;
  from?: Date;
}

export interface SearchMatch {
  expression: string;
  nextRun: Date;
  minutesFromNow: number;
}

/**
 * Given a list of cron expressions, find all that fire within
 * the specified window (default: next 60 minutes).
 */
export function searchUpcoming(
  expressions: string[],
  options: SearchOptions = {}
): SearchMatch[] {
  const { withinMinutes = 60, maxResults = 50, from = new Date() } = options;
  const cutoff = new Date(from.getTime() + withinMinutes * 60 * 1000);
  const results: SearchMatch[] = [];

  for (const expr of expressions) {
    let parsed: CronExpression;
    try {
      parsed = parseCron(expr);
    } catch {
      continue;
    }

    const runs = getNextRuns(parsed, 1, from);
    if (runs.length === 0) continue;

    const next = runs[0];
    if (next <= cutoff) {
      const minutesFromNow = Math.round((next.getTime() - from.getTime()) / 60000);
      results.push({ expression: expr, nextRun: next, minutesFromNow });
    }
  }

  results.sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
  return results.slice(0, maxResults);
}

/**
 * Format search results as a human-readable string.
 */
export function formatSearchResults(matches: SearchMatch[], withinMinutes = 60): string {
  if (matches.length === 0) {
    return `No expressions fire within the next ${withinMinutes} minute(s).`;
  }
  const lines = [`Expressions firing within next ${withinMinutes} minute(s):\n`];
  for (const m of matches) {
    const timeStr = m.nextRun.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const label = m.minutesFromNow === 0 ? 'now' : `in ${m.minutesFromNow} min`;
    lines.push(`  ${m.expression.padEnd(25)} → ${timeStr}  (${label})`);
  }
  return lines.join('\n');
}
