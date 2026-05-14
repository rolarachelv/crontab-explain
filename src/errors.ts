/**
 * Custom error types for crontab-explain.
 * Provides structured error handling across parser, validator, and CLI layers.
 */

/** Base error class for all crontab-explain errors */
export class CronError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'CronError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when a cron expression fails validation */
export class ValidationError extends CronError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Format a user-friendly error message with field context */
  toUserMessage(): string {
    if (this.field && this.value) {
      return `Invalid ${this.field} field "${this.value}": ${this.message}`;
    }
    if (this.field) {
      return `Invalid ${this.field} field: ${this.message}`;
    }
    return this.message;
  }
}

/** Thrown when a cron expression cannot be parsed */
export class ParseError extends CronError {
  constructor(
    message: string,
    public readonly expression?: string
  ) {
    super(message, 'PARSE_ERROR');
    this.name = 'ParseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toUserMessage(): string {
    if (this.expression) {
      return `Failed to parse "${this.expression}": ${this.message}`;
    }
    return this.message;
  }
}

/** Thrown when an unknown preset or alias is referenced */
export class UnknownPresetError extends CronError {
  constructor(public readonly preset: string) {
    super(`Unknown preset or alias: "${preset}"`, 'UNKNOWN_PRESET');
    this.name = 'UnknownPresetError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toUserMessage(): string {
    return `${this.message}. Run with --list-presets to see available options.`;
  }
}

/** Thrown when CLI arguments are invalid or missing */
export class CliError extends CronError {
  constructor(
    message: string,
    public readonly hint?: string
  ) {
    super(message, 'CLI_ERROR');
    this.name = 'CliError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toUserMessage(): string {
    return this.hint ? `${this.message}\nHint: ${this.hint}` : this.message;
  }
}

/**
 * Determine whether an unknown thrown value is one of our typed errors.
 */
export function isCronError(err: unknown): err is CronError {
  return err instanceof CronError;
}

/**
 * Extract a human-readable message from any thrown value,
 * preferring structured toUserMessage() when available.
 */
export function toUserMessage(err: unknown): string {
  if (
    err instanceof ValidationError ||
    err instanceof ParseError ||
    err instanceof UnknownPresetError ||
    err instanceof CliError
  ) {
    return err.toUserMessage();
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}
