import { parseSearchArgs } from './cli.search';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('parseSearchArgs', () => {
  it('parses bare expressions', () => {
    const args = parseSearchArgs(['* * * * *', '0 9 * * *']);
    expect(args.expressions).toEqual(['* * * * *', '0 9 * * *']);
    expect(args.withinMinutes).toBe(60);
    expect(args.maxResults).toBe(50);
  });

  it('parses --within flag', () => {
    const args = parseSearchArgs(['--within', '30', '* * * * *']);
    expect(args.withinMinutes).toBe(30);
    expect(args.expressions).toEqual(['* * * * *']);
  });

  it('parses -w shorthand', () => {
    const args = parseSearchArgs(['-w', '15', '* * * * *']);
    expect(args.withinMinutes).toBe(15);
  });

  it('parses --max flag', () => {
    const args = parseSearchArgs(['--max', '10', '* * * * *']);
    expect(args.maxResults).toBe(10);
  });

  it('reads expressions from --file', () => {
    const tmpFile = path.join(os.tmpdir(), 'cron-test.txt');
    fs.writeFileSync(tmpFile, '* * * * *\n# comment\n0 9 * * *\n', 'utf-8');
    const args = parseSearchArgs(['--file', tmpFile]);
    expect(args.expressions).toEqual(['* * * * *', '0 9 * * *']);
    fs.unlinkSync(tmpFile);
  });

  it('ignores blank lines and comments in file', () => {
    const tmpFile = path.join(os.tmpdir(), 'cron-test2.txt');
    fs.writeFileSync(tmpFile, '\n# this is a comment\n\n5 4 * * *\n', 'utf-8');
    const args = parseSearchArgs(['--file', tmpFile]);
    expect(args.expressions).toEqual(['5 4 * * *']);
    fs.unlinkSync(tmpFile);
  });

  it('returns empty expressions for no input', () => {
    const args = parseSearchArgs([]);
    expect(args.expressions).toEqual([]);
  });
});
