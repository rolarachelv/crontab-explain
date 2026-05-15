# Cron Linter

The `cronLinter` module provides static analysis for cron expressions, surfacing warnings, suggestions, and errors without executing any schedules.

## Usage

```ts
import { lintCron, formatLintResult } from './cronLinter';

const result = lintCron('* * * * *');
console.log(formatLintResult(result));
```

## Output

### `LintResult`

| Field         | Type             | Description                              |
|---------------|------------------|------------------------------------------|
| `valid`       | `boolean`        | Whether the expression is syntactically valid |
| `errors`      | `string[]`       | Validation errors (only when invalid)    |
| `warnings`    | `LintWarning[]`  | Non-fatal issues detected                |
| `suggestions` | `string[]`       | Improvement hints (e.g. use a preset)    |

### `LintWarning`

| Field      | Type              | Description                        |
|------------|-------------------|------------------------------------|
| `field`    | `string`          | The cron field the warning relates to |
| `message`  | `string`          | Human-readable description         |
| `severity` | `'warn' \| 'info'` | Severity level                    |

## Checks Performed

- **Syntax validation** — delegates to `validateCron`
- **Every-minute warning** — alerts when both minute and hour are `*`
- **Preset suggestion** — recommends `@daily`, `@weekly`, etc. when applicable
- **DOM + DOW conflict** — warns when both are explicitly set (OR semantics)
- **Specific month/day info** — notes infrequent schedules for review

## Integration

The linter is used by the CLI via the `--lint` flag and can be embedded in editor integrations or CI pipelines.
