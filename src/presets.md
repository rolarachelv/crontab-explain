# Cron Presets

`crontab-explain` supports the standard cron preset strings as shortcuts for common schedules.
Presets are resolved before parsing, so they work transparently with all other features.

## Supported Presets

| Preset       | Equivalent Expression | Description                                      |
|--------------|-----------------------|--------------------------------------------------|
| `@yearly`    | `0 0 1 1 *`           | Once a year at midnight on January 1st           |
| `@annually`  | `0 0 1 1 *`           | Alias for `@yearly`                              |
| `@monthly`   | `0 0 1 * *`           | Once a month at midnight on the 1st              |
| `@weekly`    | `0 0 * * 0`           | Once a week at midnight on Sunday                |
| `@daily`     | `0 0 * * *`           | Once a day at midnight                           |
| `@midnight`  | `0 0 * * *`           | Alias for `@daily`                               |
| `@hourly`    | `0 * * * *`           | Once an hour at the start of the hour            |
| `@reboot`    | *(special)*           | At system startup — next-run is not calculable   |

## Usage

```bash
crontab-explain "@daily"
# → Runs once a day at midnight
# Next runs: ...

crontab-explain "@reboot"
# → At system startup (not schedulable)
```

## API

```ts
import { resolvePreset, isPreset, expandPreset, listPresets } from './presets';

// Check if a string is a preset
isPreset('@daily');        // true
isPreset('0 0 * * *');     // false

// Get the underlying expression
expandPreset('@hourly');   // '0 * * * *'
expandPreset('5 4 * * *'); // '5 4 * * *' (pass-through)

// List all preset names
listPresets(); // ['@yearly', '@annually', ...]
```
