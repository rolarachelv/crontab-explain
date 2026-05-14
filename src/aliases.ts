/**
 * Maps common cron shorthand aliases to their 5-field equivalents.
 */

export const CRON_ALIASES: Record<string, string> = {
  '@yearly':   '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly':  '0 0 1 * *',
  '@weekly':   '0 0 * * 0',
  '@daily':    '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly':   '0 * * * *',
};

/**
 * Resolves a cron alias or returns the original expression unchanged.
 * @param input Raw cron expression or alias string.
 * @returns Resolved 5-field cron expression.
 */
export function resolveAlias(input: string): string {
  const trimmed = input.trim().toLowerCase();
  return CRON_ALIASES[trimmed] ?? input;
}

/**
 * Returns the alias name for a given expression, if one exists.
 * @param expression A 5-field cron expression.
 * @returns The matching alias (e.g. "@daily") or undefined.
 */
export function getAliasName(expression: string): string | undefined {
  const normalized = expression.trim();
  return Object.entries(CRON_ALIASES).find(([, v]) => v === normalized)?.[0];
}
