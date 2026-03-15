# @agentine/herald

[![npm version](https://img.shields.io/npm/v/@agentine/herald.svg)](https://www.npmjs.com/package/@agentine/herald)
[![npm downloads](https://img.shields.io/npm/dm/@agentine/herald.svg)](https://www.npmjs.com/package/@agentine/herald)
[![CI](https://img.shields.io/github/actions/workflow/status/agentine/herald/ci.yml?branch=main&label=CI)](https://github.com/agentine/herald/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/@agentine/herald.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)

Cross-platform desktop notifications for Node.js — drop-in replacement for [node-notifier](https://github.com/mikaelbr/node-notifier).

Zero dependencies. Pure TypeScript. No bundled binaries.

## Installation

```bash
npm install @agentine/herald
```

## Quick Start

```typescript
import { notify } from '@agentine/herald';

await notify({
  title: 'Build Complete',
  message: 'All tests passed',
});
```

## API Reference

### `notify(options): Promise<NotificationResult>`

Send a notification using the auto-detected platform provider.

```typescript
import { notify } from '@agentine/herald';

const result = await notify({
  title: 'Deployment',
  message: 'Production deploy succeeded',
  icon: './icon.png',
  sound: true,
  timeout: 10,
});

console.log(result.success); // true or false
```

### NotifyOptions

| Field | Type | Platform | Description |
|-------|------|----------|-------------|
| `title` | `string` | All | Notification title (required) |
| `message` | `string` | All | Notification body (required) |
| `subtitle` | `string` | macOS | Secondary line below the title |
| `icon` | `string` | Windows, Linux | Path to icon image |
| `sound` | `boolean \| string` | macOS, Windows | Play sound (`true` for default; on macOS pass a named sound e.g. `"Ping"`) |
| `timeout` | `number` | Linux | Auto-dismiss after N seconds (passed as milliseconds to `notify-send`) |
| `actions` | `string[]` | Linux | Action button labels (requires a compatible notification daemon) |
| `wait` | `boolean` | — | Reserved for future use |
| `appId` | `string` | Windows | Application identifier shown in notification centre (defaults to `"herald"`) |
| `urgency` | `"low" \| "normal" \| "critical"` | Linux | Maps to `--urgency` flag of `notify-send` |

### NotificationResult

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether the notification was sent |
| `action` | `string?` | Action taken by the user |
| `error` | `Error?` | Error if notification failed |

### Platform-Specific Providers

```typescript
import { NotificationCenter, WindowsBalloon, NotifySend } from '@agentine/herald';

// macOS
const nc = new NotificationCenter();
await nc.notify({ title: 'macOS', message: 'via osascript', sound: 'Ping' });

// Windows
const wb = new WindowsBalloon();
await wb.notify({ title: 'Windows', message: 'via PowerShell', appId: 'com.myapp' });

// Linux
const ns = new NotifySend();
await ns.notify({ title: 'Linux', message: 'via notify-send', urgency: 'critical' });
```

### FallbackChain

Try multiple notification strategies in order, returning the first success:

```typescript
import { FallbackChain, NotificationCenter, NotifySend } from '@agentine/herald';

const chain = new FallbackChain([
  new NotificationCenter(),
  new NotifySend(),
]);

await chain.notify({ title: 'Fallback', message: 'Tries each in order' });
```


## Migration from node-notifier

### Step 1: Install

```bash
npm uninstall node-notifier
npm install @agentine/herald
```

### Step 2: Update imports

**Callback style (node-notifier API):**

```typescript
// Before
const notifier = require('node-notifier');
notifier.notify({ title: 'Hello', message: 'World' });

// After
import notifier from '@agentine/herald';
notifier.notify({ title: 'Hello', message: 'World' });
```

**Promise style (recommended):**

```typescript
// Before
const notifier = require('node-notifier');
notifier.notify({ title: 'Hello', message: 'World' }, (err) => { ... });

// After
import { notify } from '@agentine/herald';
const result = await notify({ title: 'Hello', message: 'World' });
```

### Step 3: Event listeners (optional)

```typescript
import notifier from '@agentine/herald';

notifier.on('click', (result) => console.log('Clicked'));
notifier.on('timeout', (result) => console.log('Dismissed'));

notifier.notify({ title: 'Hello', message: 'World' });
```

## Platform Requirements

| Platform | Tool | Notes |
|----------|------|-------|
| macOS | `osascript` | Built-in on all macOS versions |
| Windows | PowerShell 5+ | Built-in on Windows 10+. Optionally install [BurntToast](https://github.com/Windos/BurntToast) for richer notifications |
| Linux | `notify-send` | Install via `sudo apt install libnotify-bin` (Debian/Ubuntu) or `sudo dnf install libnotify` (Fedora). Falls back to D-Bus via `gdbus` |

## Comparison with node-notifier

| Feature | node-notifier | @agentine/herald |
|---------|--------------|-----------------|
| Bundled binaries | Yes (terminal-notifier, snoreToast) | No |
| Runtime dependencies | 7 | 0 |
| TypeScript | Partial (@types) | Native |
| Module format | CJS only | ESM + CJS |
| macOS | terminal-notifier binary | osascript (built-in) |
| Windows | snoreToast binary | PowerShell + BurntToast/WinRT |
| Linux | notify-send | notify-send + D-Bus fallback |
| API style | Callback | Promise + callback compat |
| Maintained | Last commit Jan 2023 | Active |

## Security

Herald escapes all user-supplied strings before passing them to OS notification tools.

| Platform | Mechanism | What is escaped |
|----------|-----------|-----------------|
| macOS | JXA via `osascript -e` | Backslashes, double quotes, newlines, carriage returns inside the JavaScript string literal |
| Windows (WinRT) | XML template embedded in PowerShell | `&`, `<`, `>` XML entities in the toast XML body |
| Windows (PowerShell args) | PowerShell double-quoted strings | Backticks, double quotes, `$`, newlines, carriage returns |
| Linux | `execFile` argument array | OS handles argument isolation — no shell interpolation |

**Windows WinRT XML injection** — title and message values are XML-escaped (`&amp;`, `&lt;`, `&gt;`) before insertion into the WinRT toast template. Unescaped `<` or `&` characters in input would otherwise break the XML document and could be abused to inject arbitrary toast XML elements.

**General recommendations:**
- Validate and sanitise notification content before passing user-controlled strings to `notify()`.
- Avoid embedding raw user input in notification titles/messages in security-sensitive contexts without additional sanitisation.

## License

MIT
