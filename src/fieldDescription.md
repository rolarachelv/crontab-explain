# Field Description Module

The `fieldDescription` module provides human-readable descriptions for individual cron expression fields.

## API

### `describeField(expr: string, field: FieldName): string`

Returns a natural-language description of a single cron field expression.

| Input | Field | Output |
|-------|-------|--------|
| `*` | minute | `every minute` |
| `5` | minute | `minute 5` |
| `*/5` | minute | `every 5 minutes` |
| `1,2,3` | dow | `dows Mon, Tue, Wed` |
| `3` | month | `month Mar` |
| `1-3` | month | `months Jan, Feb, Mar` |

### `describeAllFields(parts: string[]): Record<FieldName, string>`

Accepts the five cron fields as an array and returns a record mapping each `FieldName` to its description.

```ts
import { describeAllFields } from './fieldDescription';

const parts = ['*/5', '2', '*', '1', '1-5'];
const desc  = describeAllFields(parts);
// desc.minute => 'every 5 minutes'
// desc.hour   => 'hour 2'
// desc.month  => 'month Jan'
```

## Field Names

| Position | FieldName | Range |
|----------|-----------|-------|
| 0 | minute | 0–59 |
| 1 | hour | 0–23 |
| 2 | dom | 1–31 |
| 3 | month | 1–12 |
| 4 | dow | 0–6 |
