#!/usr/bin/env node
import { parseCron } from './parser';
import { getNextRuns } from './nextRun';
import { formatSummary, formatDate } from './formatter';

const HELP_TEXT = `
crontab-explain — Parse cron expressions into human-readable schedules

Usage:
  crontab-explain <cron-expression> [options]

Options:
  -n, --next <count>   Number of next run timestamps to show (default: 5)
  -h, --help           Show this help message

Examples:
  crontab-explain "0 9 * * 1-5"
  crontab-explain "*/15 * * * *" --next 3
  crontab-explain "0 0 1 * *" -n 10
`.trim();

function parseArgs(argv: string[]): { expression: string; count: number } | null {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const expression = args[0];
  let count = 5;

  const nextFlagIndex = args.findIndex(a => a === '-n' || a === '--next');
  if (nextFlagIndex !== -1) {
    const value = parseInt(args[nextFlagIndex + 1], 10);
    if (isNaN(value) || value < 1) {
      console.error('Error: --next must be a positive integer');
      process.exit(1);
    }
    count = value;
  }

  return { expression, count };
}

function run(): void {
  const parsed = parseArgs(process.argv);
  if (!parsed) return;

  const { expression, count } = parsed;

  let cronResult;
  try {
    cronResult = parseCron(expression);
  } catch (err) {
    console.error(`Error: Invalid cron expression — ${(err as Error).message}`);
    process.exit(1);
  }

  const summary = formatSummary(cronResult);
  console.log(`\nSchedule: ${summary}`);
  console.log(`Expression: ${expression}\n`);

  const nextRuns = getNextRuns(expression, count);
  console.log(`Next ${count} run${count !== 1 ? 's' : ''}:`);
  nextRuns.forEach((date, i) => {
    console.log(`  ${i + 1}. ${formatDate(date)}`);
  });
  console.log();
}

run();
