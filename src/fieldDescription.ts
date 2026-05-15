import { expandField } from './parser';

export type FieldName = 'minute' | 'hour' | 'dom' | 'month' | 'dow';

const FIELD_RANGES: Record<FieldName, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour:   { min: 0, max: 23 },
  dom:    { min: 1, max: 31 },
  month:  { min: 1, max: 12 },
  dow:    { min: 0, max: 6 },
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function labelValues(values: number[], field: FieldName): string[] {
  if (field === 'month') return values.map(v => MONTH_NAMES[v - 1]);
  if (field === 'dow')   return values.map(v => DOW_NAMES[v]);
  return values.map(String);
}

export function describeField(expr: string, field: FieldName): string {
  if (expr === '*') return `every ${field}`;

  const { min, max } = FIELD_RANGES[field];
  const values = expandField(expr, min, max);

  if (values.length === 0) return `no valid ${field}`;

  const labels = labelValues(values, field);

  if (values.length === 1) return `${field} ${labels[0]}`;

  // Detect step pattern
  if (values.length > 1) {
    const step = values[1] - values[0];
    const isUniform = values.every((v, i) => i === 0 || v - values[i - 1] === step);
    if (isUniform && step > 1) {
      return `every ${step} ${field}s`;
    }
  }

  if (labels.length <= 4) return `${field}s ${labels.join(', ')}`;
  return `${field}s ${labels.slice(0, 3).join(', ')} … (${labels.length} total)`;
}

export function describeAllFields(parts: string[]): Record<FieldName, string> {
  const fields: FieldName[] = ['minute', 'hour', 'dom', 'month', 'dow'];
  const result = {} as Record<FieldName, string>;
  fields.forEach((f, i) => {
    result[f] = describeField(parts[i] ?? '*', f);
  });
  return result;
}
