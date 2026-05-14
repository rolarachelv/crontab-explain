import { formatSummary, formatDate } from './formatter';
import { parseCron } from './parser';

describe('formatDate', () => {
  test('pads single-digit month and day', () => {
    const d = new Date(2024, 0, 5, 9, 3); // Jan 5, 09:03
    expect(formatDate(d)).toBe('2024-01-05 09:03');
  });

  test('formats a full date correctly', () => {
    const d = new Date(2024, 11, 31, 23, 59); // Dec 31, 23:59
    expect(formatDate(d)).toBe('2024-12-31 23:59');
  });
});

describe('formatSummary', () => {
  const fixedDate = new Date('2024-06-01T12:00:00');

  test('output contains the raw expression', () => {
    const expr = parseCron('0 * * * *');
    const output = formatSummary(expr, { from: fixedDate, nextRunCount: 3 });
    expect(output).toContain('0 * * * *');
  });

  test('output contains schedule label', () => {
    const expr = parseCron('0 * * * *');
    const output = formatSummary(expr, { from: fixedDate });
    expect(output).toContain('Schedule');
    expect(output.length).toBeGreaterThan(0);
  });

  test('output lists correct number of runs', () => {
    const expr = parseCron('* * * * *');
    const output = formatSummary(expr, { from: fixedDate, nextRunCount: 4 });
    // Expect lines "1.", "2.", "3.", "4." but NOT "5."
    expect(output).toContain('  1.');
    expect(output).toContain('  4.');
    expect(output).not.toContain('  5.');
  });

  test('shows no-runs message for impossible expression', () => {
    const expr = parseCron('0 0 31 2 *');
    const output = formatSummary(expr, { from: fixedDate, nextRunCount: 1 });
    expect(output).toContain('no upcoming runs found');
  });
});
