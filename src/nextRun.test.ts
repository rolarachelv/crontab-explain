import { getNextRuns } from './nextRun';
import { parseCron } from './parser';

describe('getNextRuns', () => {
  const fixedDate = new Date('2024-01-15T10:30:00.000Z');

  test('returns correct number of results', () => {
    const expr = parseCron('* * * * *');
    const runs = getNextRuns(expr, 5, fixedDate);
    expect(runs).toHaveLength(5);
  });

  test('every-minute schedule produces consecutive minutes', () => {
    const expr = parseCron('* * * * *');
    const runs = getNextRuns(expr, 3, fixedDate);
    const minutes = runs.map((d) => d.getUTCMinutes());
    expect(minutes[1] - minutes[0]).toBe(1);
    expect(minutes[2] - minutes[1]).toBe(1);
  });

  test('hourly schedule (@hourly) returns runs on the hour', () => {
    const expr = parseCron('0 * * * *');
    const from = new Date('2024-01-15T10:05:00.000Z');
    const runs = getNextRuns(expr, 3, from);
    runs.forEach((d) => {
      expect(d.getUTCMinutes()).toBe(0);
    });
  });

  test('specific minute and hour', () => {
    const expr = parseCron('30 9 * * *');
    const from = new Date('2024-01-15T08:00:00.000Z');
    const [first] = getNextRuns(expr, 1, from);
    expect(first.getUTCHours()).toBe(9);
    expect(first.getUTCMinutes()).toBe(30);
  });

  test('next run is always in the future', () => {
    const expr = parseCron('* * * * *');
    const now = new Date();
    const runs = getNextRuns(expr, 5, now);
    runs.forEach((d) => {
      expect(d.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  test('returns empty array when no match found within limit (impossible expression)', () => {
    // day 31 of February — will never match
    const expr = parseCron('0 0 31 2 *');
    const from = new Date('2024-01-01T00:00:00.000Z');
    const runs = getNextRuns(expr, 1, from);
    expect(runs).toHaveLength(0);
  });
});
