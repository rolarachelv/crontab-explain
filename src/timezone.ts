/**
 * timezone.ts
 * Utilities for timezone-aware next-run timestamp formatting.
 * Supports converting UTC cron schedule times to a target timezone.
 */

/**
 * Returns a list of commonly used IANA timezone strings.
 * Useful for validation and autocomplete hints in the CLI.
 */
export const COMMON_TIMEZONES: readonly string[] = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

/**
 * Checks whether a given string is a valid IANA timezone identifier
 * by attempting to use it with the Intl API.
 *
 * @param tz - The timezone string to validate.
 * @returns true if valid, false otherwise.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a Date object as a human-readable string in the specified timezone.
 *
 * @param date  - The UTC Date to format.
 * @param tz    - IANA timezone string (e.g. "America/New_York"). Defaults to "UTC".
 * @param locale - BCP 47 locale string. Defaults to "en-US".
 * @returns A locale-formatted datetime string in the target timezone.
 */
export function formatInTimezone(
  date: Date,
  tz: string = "UTC",
  locale: string = "en-US"
): string {
  if (!isValidTimezone(tz)) {
    throw new RangeError(`Invalid timezone: "${tz}"`);
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

/**
 * Returns the current UTC offset string for a timezone at a given date,
 * e.g. "+05:30" or "-04:00".
 *
 * @param tz   - IANA timezone string.
 * @param date - Reference date (defaults to now).
 * @returns UTC offset string in "±HH:MM" format.
 */
export function getUtcOffset(tz: string, date: Date = new Date()): string {
  if (!isValidTimezone(tz)) {
    throw new RangeError(`Invalid timezone: "${tz}"`);
  }

  // Use Intl to extract the numeric UTC offset in minutes
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");

  if (!offsetPart) return "+00:00";

  // offsetPart.value is like "GMT+05:30" or "GMT-04:00" or "GMT"
  const raw = offsetPart.value.replace("GMT", "");
  return raw === "" ? "+00:00" : raw;
}
