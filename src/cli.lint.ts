import { lintCron, formatLintResult, LintResult } from './cronLinter';

export interface LintCliOptions {
  expression: string;
  json?: boolean;
}

export function runLint(options: LintCliOptions): { output: string; exitCode: number } {
  const { expression, json = false } = options;

  if (!expression || expression.trim() === '') {
    return { output: 'Error: No cron expression provided.', exitCode: 1 };
  }

  const result: LintResult = lintCron(expression);

  if (json) {
    return {
      output: JSON.stringify(result, null, 2),
      exitCode: result.valid ? 0 : 1,
    };
  }

  const lines: string[] = [`Linting: "${expression}"`, ''];
  lines.push(formatLintResult(result));

  if (result.valid && result.warnings.length === 0 && result.suggestions.length === 0) {
    lines.push('');
    lines.push('All checks passed.');
  }

  return {
    output: lines.join('\n'),
    exitCode: result.valid ? 0 : 1,
  };
}

export function parseLintArgs(argv: string[]): LintCliOptions | null {
  const lintIndex = argv.indexOf('--lint');
  if (lintIndex === -1) return null;

  const expression = argv[lintIndex + 1] ?? '';
  const json = argv.includes('--json');

  return { expression, json };
}
