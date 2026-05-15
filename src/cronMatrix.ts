/**
 * cronMatrix.ts
 * Builds a visual time matrix (hour x day-of-week) showing when a cron fires.
 */

import { parseCron } from './parser';
import { expandFieldValues } from './rangeExpander';

export interface CronMatrix {
  /** Rows = hours 0-23, Cols = days 0-6 (Sun-Sat) */
  grid: boolean[][];
  hours: number[];
  days: string[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function buildCronMatrix(expression: string): CronMatrix {
  const parsed = parseCron(expression);
  const hours = expandFieldValues(parsed.hour, 0, 23);
  const dows = expandFieldValues(parsed.dow, 0, 6);

  const grid: boolean[][] = Array.from({ length: 24 }, (_, h) =>
    Array.from({ length: 7 }, (_, d) => hours.includes(h) && dows.includes(d))
  );

  return { grid, hours: Array.from({ length: 24 }, (_, i) => i), days: DAY_LABELS };
}

export function formatMatrix(matrix: CronMatrix): string {
  const header = '     ' + matrix.days.map(d => d.padStart(4)).join('');
  const separator = '     ' + '-'.repeat(matrix.days.length * 4);

  const rows = matrix.hours.map(h => {
    const label = String(h).padStart(2, '0') + ':00';
    const cells = matrix.grid[h].map(active => (active ? '  ✓ ' : '  · ')).join('');
    return label + cells;
  });

  return [header, separator, ...rows].join('\n');
}

export function matrixSummary(matrix: CronMatrix): string {
  const activeCells = matrix.grid.reduce(
    (sum, row) => sum + row.filter(Boolean).length,
    0
  );
  const activeHours = matrix.grid
    .map((row, h) => (row.some(Boolean) ? h : -1))
    .filter(h => h >= 0);
  const activeDays = matrix.days.filter((_, d) =>
    matrix.grid.some(row => row[d])
  );

  return [
    `Active slots : ${activeCells} / ${24 * 7}`,
    `Active hours : ${activeHours.map(h => `${h}:00`).join(', ') || 'none'}`,
    `Active days  : ${activeDays.join(', ') || 'none'}`,
  ].join('\n');
}
