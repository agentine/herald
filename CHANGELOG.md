# Changelog

All notable changes to `@agentine/herald` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-03-14

### Fixed

- `WindowsBalloon`: XML-escape WinRT toast title and message values (`&`, `<`, `>`) to prevent XML injection in the toast template
- `NotifySend`: use correct `--action=id=label` format for `notify-send` action buttons
- `escapeJxaArg`: strip carriage returns (`\r`) before quoting to prevent broken JXA strings on macOS
- Removed dead `escapeShellArg` utility that was no longer used

## [0.1.0] - 2026-03-14

### Added

- Initial release of `@agentine/herald`
- `notify()` function — auto-detects platform and sends desktop notification
- `NotificationCenter` provider for macOS (via `osascript` / JXA — no bundled binaries)
- `WindowsBalloon` provider for Windows (via PowerShell + BurntToast/WinRT)
- `NotifySend` provider for Linux (via `notify-send` / D-Bus `gdbus` fallback)
- `FallbackChain` utility — tries providers in order, gracefully degrades
- `Notifier` class — node-notifier-compatible default export with `EventEmitter` API (`click`, `timeout`, `error` events)
- Full TypeScript support with native type definitions (no `@types/*` needed)
- ESM + CJS dual build via `exports` map
- Zero runtime dependencies (Node.js built-ins only: `child_process`, `path`, `os`)
- Node.js ≥ 18 engine requirement
- Full `NotifyOptions` surface: `title`, `message`, `subtitle`, `icon`, `sound`, `timeout`, `actions`, `wait`, `appId`, `urgency`
- `NotificationResult` with `success`, `action`, and `error` fields
- Migration guide from node-notifier (callback → promise, import swap)
