/**
 * Public API entry point for crontab-explain.
 * Re-exports core utilities for programmatic use.
 */

export { parseCron, expandField, buildLabel } from './parser';
export { getNextRuns, matchField } from './nextRun';
export { formatSummary, formatDate } from './formatter';
export { validateCron } from './validator';
export type { ValidationResult } from './validator';
export { resolveAlias, getAliasName, CRON_ALIASES } from './aliases';

import { resolveAlias } from './aliases';
import { validateCron } from './validator';
import { parseCron } from './parser';
import { getNextRuns } from './nextRun';
import { formatSummary } from './formatter';

export interface ExplainOptions {
  /** Number of upcoming run timestamps to include. Defaults to 5. */
  count?: number;
  /** Base date for computing next runs. Defaults to now. */
  from?: Date;
}

export interface ExplainResult {
  expression: string;
  summary: string;
  nextRuns: Date[];
  validation: { valid: boolean; errors: string[] };
}

/**
 * High-level function: validates, parses, and explains a cron expression.
 * Accepts both raw 5-field expressions and shorthand aliases.
 */
export function explain(input: string, options: ExplainOptions = {}): ExplainResult {
  const expression = resolveAlias(input);
  const validation = validateCron(expression);

  if (!validation.valid) {
    return {
      expression,
      summary: `Invalid expression: ${validation.errors.join('; ')}`,
      nextRuns: [],
      validation,
    };
  }

  const parsed = parseCron(expression);
  const count = options.count ?? 5;
  const from = options.from ?? new Date();
  const nextRuns = getNextRuns(parsed, from, count);
  const summary = formatSummary(parsed, nextRuns);

  return { expression, summary, nextRuns, validation };
}
