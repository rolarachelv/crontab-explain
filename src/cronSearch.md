# cronSearch

The `cronSearch` module lets you filter a list of cron expressions to those
that will fire within a configurable time window.

## API

### `searchUpcoming(expressions, options?)`

Returns all `SearchMatch` objects for expressions that fire within the window.

| Option | Type | Default | Description |
|---|---|---|---|
| `withinMinutes` | `number` | `60` | How many minutes ahead to search |
| `maxResults` | `number` | `50` | Maximum number of results to return |
| `from` | `Date` | `new Date()` | Reference start time |

**SearchMatch shape:**

```ts
{
  expression: string;      // original cron string
  nextRun: Date;           // next fire time
  minutesFromNow: number;  // rounded minutes until next fire
}
```

Invalid expressions are silently skipped. Results are sorted by `nextRun`
ascending.

### `formatSearchResults(matches, withinMinutes?)`

Returns a human-readable summary string, e.g.:

```
Expressions firing within next 60 minute(s):

  * * * * *                 → 2024-01-15 12:01 UTC  (in 1 min)
  5 12 * * *                → 2024-01-15 12:05 UTC  (in 5 min)
```

## CLI

```
crontab-explain search [--within N] [--max N] [--file path] <expr...>
```

- `--within N` / `-w N` — window in minutes (default 60)
- `--max N` / `-m N` — max results (default 50)
- `--file path` / `-f path` — read expressions from a file (one per line,
  lines starting with `#` are ignored)
