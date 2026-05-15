# Cron Normalizer

The `cronNormalizer` module transforms any valid cron expression into its **canonical form**, making it easier to compare, deduplicate, and reason about schedules.

## What is a canonical form?

A canonical cron expression is one where:

- All **presets** (`@daily`, `@weekly`, etc.) are expanded to their five-field equivalents.
- All **named aliases** (`JAN`, `MON`, etc.) are replaced with their numeric values.
- Fields that cover their **full range** are collapsed to `*`.
  - `*/1` → `*`
  - `0-59` (minutes) → `*`
  - `0-23` (hours) → `*`
  - `1-31` (day-of-month) → `*`
  - `1-12` (month) → `*`
  - `0-7` (day-of-week) → `*`

## API

### `normalizeCron(expr: string): NormalizeResult`

Normalizes a single cron expression and returns:

```ts
interface NormalizeResult {
  original: string;    // the input expression
  normalized: string;  // the canonical form
  changes: string[];   // human-readable list of transformations applied
}
```

### `collapseFullRange(field: string, min: number, max: number): string`

Collapses a field value to `*` if it covers the full allowed range.

### `formatNormalize(result: NormalizeResult): string`

Formats a `NormalizeResult` for terminal output.

## Canonical Map

The `canonicalMap` module builds a deduplication map from a list of expressions:

```ts
const result = buildCanonicalMap(['@daily', '0 0 * * *', '*/5 * * * *']);
console.log(formatCanonicalMap(result));
```

Output example:

```
Total: 3 | Unique: 2 | Duplicates: 1

[DUP] 0 0 * * *
       ← @daily
       ← 0 0 * * *
      */5 * * * *
```

## Use Cases

- **Crontab auditing**: find duplicate or equivalent schedules.
- **CI/CD pipelines**: normalize expressions before storing them.
- **Diffing**: compare two crontabs after normalization for meaningful diffs.
