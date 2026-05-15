import { validateCron } from './validator';
import { parseCron } from './parser';
import { resolveAlias, getAliasName } from './aliases';
import { isPreset } from './presets';
import { CronExpression } from './types';

export interface LintWarning {
  field: string;
  message: string;
  severity: 'warn' | 'info';
}

export interface LintResult {
  valid: boolean;
  errors: string[];
  warnings: LintWarning[];
  suggestions: string[];
}

const COMMON_PRESETS: Record<string, string> = {
  '0 * * * *': '@hourly',
  '0 0 * * *': '@daily',
  '0 0 * * 0': '@weekly',
  '0 0 1 * *': '@monthly',
  '0 0 1 1 *': '@yearly',
};

export function lintCron(expr: string): LintResult {
  const result: LintResult = { valid: true, errors: [], warnings: [], suggestions: [] };

  const resolved = resolveAlias(expr.trim());
  const validation = validateCron(resolved);

  if (!validation.valid) {
    result.valid = false;
    result.errors = validation.errors ?? ['Invalid cron expression'];
    return result;
  }

  let parsed: CronExpression;
  try {
    parsed = parseCron(resolved);
  } catch {
    result.valid = false;
    result.errors.push('Failed to parse expression');
    return result;
  }

  // Warn about overly frequent schedules
  if (parsed.minute === '*' && parsed.hour === '*') {
    result.warnings.push({ field: 'minute', message: 'Expression runs every minute — is this intentional?', severity: 'warn' });
  }

  // Suggest preset alias if applicable
  if (!isPreset(expr) && COMMON_PRESETS[resolved]) {
    result.suggestions.push(`Consider using the preset alias "${COMMON_PRESETS[resolved]}" instead.`);
  }

  // Warn about day-of-week and day-of-month both set
  if (parsed.dayOfMonth !== '*' && parsed.dayOfWeek !== '*') {
    result.warnings.push({ field: 'dom/dow', message: 'Both day-of-month and day-of-week are set; cron treats these as OR conditions.', severity: 'warn' });
  }

  // Info about year-end schedule
  if (parsed.month !== '*' && parsed.dayOfMonth !== '*') {
    result.warnings.push({ field: 'month', message: 'Specific month and day combination — verify intended frequency.', severity: 'info' });
  }

  return result;
}

export function formatLintResult(result: LintResult): string {
  const lines: string[] = [];
  if (!result.valid) {
    lines.push('✗ Invalid expression:');
    result.errors.forEach(e => lines.push(`  ERROR: ${e}`));
    return lines.join('\n');
  }
  lines.push('✓ Expression is valid.');
  result.warnings.forEach(w => lines.push(`  [${w.severity.toUpperCase()}] (${w.field}) ${w.message}`));
  result.suggestions.forEach(s => lines.push(`  SUGGESTION: ${s}`));
  if (result.warnings.length === 0 && result.suggestions.length === 0) {
    lines.push('  No issues found.');
  }
  return lines.join('\n');
}
