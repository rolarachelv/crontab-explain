import { execSync, spawnSync } from 'child_process';
import * as path from 'path';

const CLI_PATH = path.resolve(__dirname, '../src/cli.ts');
const RUN_CMD = `ts-node ${CLI_PATH}`;

function runCli(args: string): { stdout: string; stderr: string; status: number } {
  const result = spawnSync('npx', ['ts-node', CLI_PATH, ...args.split(' ')], {
    encoding: 'utf-8',
    env: { ...process.env },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

describe('CLI integration', () => {
  it('prints help when no arguments are given', () => {
    const { stdout, status } = runCli('');
    expect(stdout).toContain('crontab-explain');
    expect(stdout).toContain('Usage');
    expect(status).toBe(0);
  });

  it('prints help with --help flag', () => {
    const { stdout, status } = runCli('--help');
    expect(stdout).toContain('Options');
    expect(status).toBe(0);
  });

  it('parses a valid cron expression and shows next runs', () => {
    const { stdout, status } = runCli('"0 9 * * 1-5"');
    expect(status).toBe(0);
    expect(stdout).toContain('Schedule:');
    expect(stdout).toContain('Next 5 runs:');
  });

  it('respects --next flag for run count', () => {
    const { stdout, status } = runCli('"*/5 * * * *" --next 3');
    expect(status).toBe(0);
    expect(stdout).toContain('Next 3 runs:');
    const lines = stdout.split('\n').filter(l => /^\s+\d+\./.test(l));
    expect(lines).toHaveLength(3);
  });

  it('exits with error on invalid cron expression', () => {
    const { stderr, status } = runCli('"invalid cron"');
    expect(status).toBe(1);
    expect(stderr).toContain('Error');
  });

  it('exits with error when --next value is not a number', () => {
    const { stderr, status } = runCli('"* * * * *" --next abc');
    expect(status).toBe(1);
    expect(stderr).toContain('--next must be a positive integer');
  });
});
