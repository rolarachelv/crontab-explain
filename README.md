# crontab-explain

> A terminal utility that parses cron expressions and outputs a human-readable schedule summary with next-run timestamps.

---

## Installation

```bash
npm install -g crontab-explain
```

Or run without installing:

```bash
npx crontab-explain "*/15 * * * *"
```

---

## Usage

Pass any valid cron expression as an argument:

```bash
crontab-explain "0 9 * * 1-5"
```

**Output:**

```
Expression : 0 9 * * 1-5
Schedule   : At 09:00 AM, Monday through Friday
Timezone   : UTC

Next 5 runs:
  1. Mon, 14 Jul 2025 09:00:00 UTC
  2. Tue, 15 Jul 2025 09:00:00 UTC
  3. Wed, 16 Jul 2025 09:00:00 UTC
  4. Thu, 17 Jul 2025 09:00:00 UTC
  5. Fri, 18 Jul 2025 09:00:00 UTC
```

### Options

| Flag              | Description                              |
|-------------------|------------------------------------------|
| `--count <n>`     | Number of next-run timestamps to display (default: `5`) |
| `--tz <timezone>` | Timezone for output (default: `UTC`)     |
| `--json`          | Output results as JSON                   |

```bash
crontab-explain "0 0 1 * *" --count 3 --tz "America/New_York"
```

---

## Requirements

- Node.js >= 18

---

## License

[MIT](LICENSE)