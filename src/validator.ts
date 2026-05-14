/**
 * Validates cron expression fields and returns structured error messages.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const FIELD_RANGES: Record<string, { min: number; max: number; name: string }> = {
  minute:     { min: 0,  max: 59, name: 'Minute' },
  hour:       { min: 0,  max: 23, name: 'Hour' },
  dayOfMonth: { min: 1,  max: 31, name: 'Day of Month' },
  month:      { min: 1,  max: 12, name: 'Month' },
  dayOfWeek:  { min: 0,  max: 7,  name: 'Day of Week' },
};

const FIELD_KEYS = Object.keys(FIELD_RANGES) as Array<keyof typeof FIELD_RANGES>;

function validateSingleField(value: string, field: keyof typeof FIELD_RANGES): string[] {
  const { min, max, name } = FIELD_RANGES[field];
  const errors: string[] = [];

  if (value === '*') return errors;

  const parts = value.split(',');
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const stepNum = Number(step);
      if (isNaN(stepNum) || stepNum < 1) {
        errors.push(`${name}: invalid step value "${step}"`);
      }
      if (range !== '*') {
        errors.push(...validateRange(range, min, max, name));
      }
    } else if (part.includes('-')) {
      errors.push(...validateRange(part, min, max, name));
    } else {
      const num = Number(part);
      if (isNaN(num) || num < min || num > max) {
        errors.push(`${name}: value "${part}" out of range [${min}-${max}]`);
      }
    }
  }
  return errors;
}

function validateRange(range: string, min: number, max: number, name: string): string[] {
  const [startStr, endStr] = range.split('-');
  const start = Number(startStr);
  const end = Number(endStr);
  const errors: string[] = [];
  if (isNaN(start) || start < min || start > max) {
    errors.push(`${name}: range start "${startStr}" out of range [${min}-${max}]`);
  }
  if (isNaN(end) || end < min || end > max) {
    errors.push(`${name}: range end "${endStr}" out of range [${min}-${max}]`);
  }
  if (!isNaN(start) && !isNaN(end) && start > end) {
    errors.push(`${name}: range start ${start} is greater than end ${end}`);
  }
  return errors;
}

export function validateCron(expression: string): ValidationResult {
  const errors: string[] = [];
  const fields = expression.trim().split(/\s+/);

  if (fields.length !== 5) {
    return {
      valid: false,
      errors: [`Expected 5 fields, got ${fields.length}. Format: <minute> <hour> <day> <month> <weekday>`],
    };
  }

  fields.forEach((field, i) => {
    const key = FIELD_KEYS[i];
    errors.push(...validateSingleField(field, key));
  });

  return { valid: errors.length === 0, errors };
}
