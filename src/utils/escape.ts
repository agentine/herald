/**
 * Escape a shell argument for POSIX shells (macOS/Linux).
 * Wraps in single quotes, escaping any embedded single quotes.
 */
export function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Escape a string for use inside a PowerShell double-quoted string or command argument.
 * Escapes characters that have special meaning in PowerShell.
 */
export function escapePowerShellArg(arg: string): string {
  // Escape backticks, double quotes, dollar signs, and newlines
  return arg
    .replace(/`/g, "``")
    .replace(/"/g, '`"')
    .replace(/\$/g, "`$")
    .replace(/\n/g, "`n")
    .replace(/\r/g, "`r");
}

/**
 * Escape a string for use in a JXA/AppleScript osascript -e argument.
 * Escapes backslashes and double quotes for JavaScript string context.
 */
export function escapeJxaArg(arg: string): string {
  return arg.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
