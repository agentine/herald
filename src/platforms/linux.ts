import { execFile } from "node:child_process";
import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";
import { isToolAvailable } from "./detect.js";

export class NotifySend implements INotifier {
  async notify(options: NotifyOptions): Promise<NotificationResult> {
    if (isToolAvailable("notify-send")) {
      return this.viaNotifySend(options);
    }
    if (isToolAvailable("gdbus")) {
      return this.viaDBus(options);
    }
    return {
      success: false,
      error: new Error("No notification tool available (need notify-send or gdbus)"),
    };
  }

  private viaNotifySend(options: NotifyOptions): Promise<NotificationResult> {
    const args = buildNotifySendArgs(options);
    return new Promise<NotificationResult>((resolve) => {
      execFile("notify-send", args, (error) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  private viaDBus(options: NotifyOptions): Promise<NotificationResult> {
    const args = buildDBusArgs(options);
    return new Promise<NotificationResult>((resolve) => {
      execFile("gdbus", args, (error) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

function buildNotifySendArgs(options: NotifyOptions): string[] {
  const args: string[] = [];

  if (options.urgency) {
    args.push("--urgency", options.urgency);
  }

  if (options.icon) {
    args.push("--icon", options.icon);
  }

  if (options.timeout !== undefined) {
    args.push("--expire-time", String(options.timeout * 1000));
  }

  if (options.actions && options.actions.length > 0) {
    for (const action of options.actions) {
      args.push("--action", action);
    }
  }

  args.push(options.title, options.message);

  return args;
}

function buildDBusArgs(options: NotifyOptions): string[] {
  const icon = options.icon ?? "";
  const timeout = options.timeout !== undefined ? options.timeout * 1000 : -1;

  return [
    "call",
    "--session",
    "--dest=org.freedesktop.Notifications",
    "--object-path=/org/freedesktop/Notifications",
    "--method=org.freedesktop.Notifications.Notify",
    "herald",          // app_name
    "0",               // replaces_id
    icon,              // app_icon
    options.title,     // summary
    options.message,   // body
    "[]",              // actions
    "{}",              // hints
    String(timeout),   // expire_timeout
  ];
}

export {
  buildNotifySendArgs as _buildNotifySendArgs,
  buildDBusArgs as _buildDBusArgs,
};
