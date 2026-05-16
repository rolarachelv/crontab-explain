import { searchUpcoming, formatSearchResults } from './cronSearch';
import * as fs from 'fs';

export interface SearchArgs {
  expressions: string[];
  withinMinutes: number;
  maxResults: number;
  file?: string;
}

export function parseSearchArgs(argv: string[]): SearchArgs {
  const args: SearchArgs = { expressions: [], withinMinutes: 60, maxResults: 50 };
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--within' || arg === '-w') {
      args.withinMinutes = parseInt(argv[++i] ?? '60', 10);
    } else if (arg === '--max' || arg === '-m') {
      args.maxResults = parseInt(argv[++i] ?? '50', 10);
    } else if (arg === '--file' || arg === '-f') {
      args.file = argv[++i];
    } else {
      rest.push(arg);
    }
  }

  if (args.file) {
    const raw = fs.readFileSync(args.file, 'utf-8');
    args.expressions = raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));
  } else {
    args.expressions = rest;
  }

  return args;
}

export function runSearch(argv: string[]): void {
  const args = parseSearchArgs(argv);

  if (args.expressions.length === 0) {
    console.error('Usage: crontab-explain search [--within N] [--max N] [--file path] <expr...>');
    process.exit(1);
  }

  const matches = searchUpcoming(args.expressions, {
    withinMinutes: args.withinMinutes,
    maxResults: args.maxResults,
  });

  console.log(formatSearchResults(matches, args.withinMinutes));
}
