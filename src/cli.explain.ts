import { explainCron, formatExplainer } from './cronExplainer';
import { getNextRuns } from './nextRun';
import { formatDate } from './formatter';

export interface ExplainArgs {
  expression: string;
  count: number;
  timezone?: string;
}

export function parseExplainArgs(argv: string[]): ExplainArgs {
  const args = argv.slice(2);
  const countIndex = args.indexOf('--count');
  const tzIndex = args.indexOf('--tz');

  const count = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) || 3 : 3;
  const timezone = tzIndex !== -1 ? args[tzIndex + 1] : undefined;

  const expression = args
    .filter((_, i) => {
      if (args[i - 1] === '--count' || args[i - 1] === '--tz') return false;
      if (args[i] === '--count' || args[i] === '--tz') return false;
      return true;
    })
    .join(' ');

  return { expression, count, timezone };
}

export function runExplain(argv: string[]): void {
  const { expression, count, timezone } = parseExplainArgs(argv);

  if (!expression) {
    console.error('Usage: crontab-explain explain "<cron expression>" [--count N] [--tz Timezone]');
    process.exit(1);
  }

  try {
    const result = explainCron(expression);
    console.log(formatExplainer(result));

    const nextRuns = getNextRuns(expression, count, timezone ? { timezone } : undefined);
    if (nextRuns.length > 0) {
      console.log(`\nNext ${count} run(s):`);
      nextRuns.forEach((date, i) => {
        console.log(`  ${i + 1}. ${formatDate(date, timezone)}`);
      });
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
