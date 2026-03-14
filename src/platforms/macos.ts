import { execFile } from "node:child_process";
import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";
import { escapeJxaArg } from "../utils/escape.js";

export class NotificationCenter implements INotifier {
  async notify(options: NotifyOptions): Promise<NotificationResult> {
    const script = buildJxaScript(options);
    return new Promise<NotificationResult>((resolve) => {
      execFile("osascript", ["-l", "JavaScript", "-e", script], (error) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

function buildJxaScript(options: NotifyOptions): string {
  const app = "Application.currentApplication()";
  const title = escapeJxaArg(options.title);
  const message = escapeJxaArg(options.message);

  const parts: string[] = [];
  parts.push(`var app = ${app};`);
  parts.push("app.includeStandardAdditions = true;");

  let displayArgs = `"${message}", { withTitle: "${title}"`;

  if (options.subtitle) {
    displayArgs += `, subtitle: "${escapeJxaArg(options.subtitle)}"`;
  }

  if (options.sound !== undefined && options.sound !== false) {
    const soundName =
      typeof options.sound === "string" ? options.sound : "default";
    displayArgs += `, soundName: "${escapeJxaArg(soundName)}"`;
  }

  displayArgs += " }";

  parts.push(`app.displayNotification(${displayArgs});`);

  return parts.join(" ");
}

export { buildJxaScript as _buildJxaScript };
