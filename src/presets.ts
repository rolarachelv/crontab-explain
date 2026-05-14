/**
 * Common cron presets with human-readable labels.
 * Maps preset names to their cron expression equivalents.
 */

export interface CronPreset {
  expression: string;
  description: string;
}

const PRESETS: Record<string, CronPreset> = {
  '@yearly':   { expression: '0 0 1 1 *',   description: 'Once a year at midnight on January 1st' },
  '@annually': { expression: '0 0 1 1 *',   description: 'Once a year at midnight on January 1st' },
  '@monthly':  { expression: '0 0 1 * *',   description: 'Once a month at midnight on the 1st' },
  '@weekly':   { expression: '0 0 * * 0',   description: 'Once a week at midnight on Sunday' },
  '@daily':    { expression: '0 0 * * *',   description: 'Once a day at midnight' },
  '@midnight': { expression: '0 0 * * *',   description: 'Once a day at midnight' },
  '@hourly':   { expression: '0 * * * *',   description: 'Once an hour at the start of the hour' },
  '@reboot':   { expression: '@reboot',      description: 'At system startup (not schedulable)' },
};

/**
 * Resolves a preset string (e.g. "@daily") to its CronPreset definition.
 * Returns undefined if the input is not a known preset.
 */
export function resolvePreset(input: string): CronPreset | undefined {
  const key = input.trim().toLowerCase();
  return PRESETS[key];
}

/**
 * Returns true if the input is a recognised cron preset.
 */
export function isPreset(input: string): boolean {
  return resolvePreset(input) !== undefined;
}

/**
 * Returns the cron expression for a preset, or the original string
 * if no preset matches (pass-through for normal expressions).
 */
export function expandPreset(input: string): string {
  const preset = resolvePreset(input);
  return preset ? preset.expression : input;
}

/**
 * Returns all registered preset names.
 */
export function listPresets(): string[] {
  return Object.keys(PRESETS);
}
