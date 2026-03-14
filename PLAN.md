# Herald — Cross-Platform Desktop Notifications for Node.js

**Replaces:** [node-notifier](https://github.com/mikaelbr/node-notifier) (6.36M weekly downloads, unmaintained since Jan 2023)
**Package:** `@agentine/herald`
**Language:** TypeScript

## Problem

node-notifier is the de facto standard for cross-platform desktop notifications in Node.js. It has 6.36M weekly downloads, 5.8K stars, and is a transitive dependency of major tools. However:

- **Single maintainer** (mikaelbr) — last human commit January 2023 (3.5 years ago)
- **125+ open issues** including platform bugs and feature requests
- **Stale PRs** — Apple Silicon fix from April 2024 still unmerged
- **Bundled native binaries** (terminal-notifier, snoreToast) — security and maintenance burden
- **No viable alternative** — toasted-notifier fork has only 43K weekly downloads, 23 stars

## Architecture

Herald is a pure TypeScript notification library that uses OS-native CLI tools instead of bundled binaries.

### Platform Strategies

| Platform | Mechanism | Features |
|----------|-----------|----------|
| macOS | `osascript` (JXA/AppleScript) | Title, message, subtitle, sound, icon, click actions |
| Windows | PowerShell + BurntToast / WinRT | Title, message, icon, actions, app ID |
| Linux | `notify-send` (libnotify) / D-Bus | Title, message, urgency, icon, actions, timeout |

### Key Design Decisions

1. **No bundled binaries** — Uses OS-native tools (osascript, PowerShell, notify-send). Reduces package size, eliminates binary compatibility issues, and improves security.
2. **TypeScript first** — Full type definitions, strict types, modern ESM + CJS dual export.
3. **API compatible** — Drop-in replacement API matching node-notifier's interface for easy migration.
4. **Fallback chain** — Each platform has ordered strategies. If preferred method unavailable, gracefully falls back.
5. **Zero runtime dependencies** — Uses only Node.js built-in modules (child_process, path, os).

### Module Structure

```
src/
  index.ts              # Public API, platform detection, notification dispatch
  types.ts              # Shared types and interfaces
  platforms/
    detect.ts           # OS detection and capability probing
    macos.ts            # macOS notification via osascript
    windows.ts          # Windows notification via PowerShell/BurntToast
    linux.ts            # Linux notification via notify-send / D-Bus
  utils/
    escape.ts           # Shell argument escaping per platform
    fallback.ts         # Fallback chain logic
```

## Public API

```typescript
import { notify } from '@agentine/herald';

// Simple
await notify({ title: 'Build Complete', message: 'All tests passed' });

// Full options
await notify({
  title: 'Deployment',
  message: 'Production deploy succeeded',
  icon: './icon.png',
  sound: true,
  timeout: 10,
  actions: ['View', 'Dismiss'],
  wait: true,  // Wait for user interaction
});

// Platform-specific
import { NotificationCenter, WindowsBalloon, NotifySend } from '@agentine/herald';
const nc = new NotificationCenter();
await nc.notify({ title: 'macOS specific', sound: 'Ping' });
```

## Compatibility Layer

Provide a node-notifier-compatible API so existing users can migrate with minimal changes:

```typescript
// Migration: change import only
// Before: const notifier = require('node-notifier');
// After:
import notifier from '@agentine/herald';
notifier.notify({ title: 'Hello', message: 'World' });
```

## Deliverables

1. TypeScript source with full type definitions
2. ESM + CJS dual build
3. Comprehensive test suite (unit + integration per platform)
4. README with migration guide from node-notifier
5. CI/CD pipeline (GitHub Actions)
6. Published to npm as `@agentine/herald`

## Scope Boundaries

- **In scope:** macOS, Windows, Linux desktop notifications; node-notifier API compatibility; TypeScript; zero dependencies.
- **Out of scope:** Growl support (deprecated); balloon tips on Windows (legacy); mobile notifications; electron-specific APIs.
