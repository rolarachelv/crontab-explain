/**
 * Shared TypeScript types and interfaces for crontab-explain.
 */

/** The five standard cron fields in order */
export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

/** Ranges allowed for each cron field */
export const FIELD_RANGES: Record<CronFieldName, { min: number; max: number }> = {
  minute:     { min: 0, max: 59 },
  hour:       { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month:      { min: 1, max: 12 },
  dayOfWeek:  { min: 0, max: 7 },  // 0 and 7 both represent Sunday
};

/** A parsed representation of a single cron field */
export interface ParsedField {
  /** Original raw string for this field (e.g. "*/5", "1-5", "3") */
  raw: string;
  /** Expanded list of matching numeric values */
  values: number[];
  /** Human-readable label describing the field (e.g. "every 5 minutes") */
  label: string;
}

/** A fully parsed cron expression */
export interface ParsedCron {
  /** Original expression string */
  expression: string;
  /** Resolved alias name if the expression was a special string (e.g. "@daily") */
  alias?: string;
  minute:     ParsedField;
  hour:       ParsedField;
  dayOfMonth: ParsedField;
  month:      ParsedField;
  dayOfWeek:  ParsedField;
}

/** Options for controlling output of the explain function */
export interface ExplainOptions {
  /** Number of next-run timestamps to display (default: 5) */
  nextRunCount?: number;
  /** Whether to use UTC for date formatting (default: false) */
  utc?: boolean;
  /** Whether to output plain text without ANSI color codes (default: false) */
  noColor?: boolean;
}

/** The full explanation result returned by explain() */
export interface ExplainResult {
  /** Parsed cron structure */
  parsed: ParsedCron;
  /** Human-readable summary sentence */
  summary: string;
  /** Array of upcoming run Date objects */
  nextRuns: Date[];
  /** Formatted string ready for terminal output */
  formatted: string;
}

/** Validation result for a cron expression or field */
export interface ValidationResult {
  valid: boolean;
  /** List of error messages; empty when valid */
  errors: string[];
}
