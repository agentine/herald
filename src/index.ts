import { EventEmitter } from "node:events";
import type { NotifyOptions, NotificationResult, INotifier } from "./types.js";
import { NotificationCenter } from "./platforms/macos.js";
import { WindowsBalloon } from "./platforms/windows.js";
import { NotifySend } from "./platforms/linux.js";
import { detectPlatform } from "./platforms/detect.js";
export type { NotifyOptions, NotificationResult, INotifier } from "./types.js";
export { NotificationCenter } from "./platforms/macos.js";
export { WindowsBalloon } from "./platforms/windows.js";
export { NotifySend } from "./platforms/linux.js";
export { FallbackChain } from "./utils/fallback.js";

function createNotifier(): INotifier {
  const platform = detectPlatform();
  switch (platform) {
    case "darwin":
      return new NotificationCenter();
    case "win32":
      return new WindowsBalloon();
    case "linux":
      return new NotifySend();
  }
}

export async function notify(
  options: NotifyOptions
): Promise<NotificationResult> {
  const notifier = createNotifier();
  return notifier.notify(options);
}

type NotifyCallback = (
  error: Error | null,
  result?: NotificationResult
) => void;

class Notifier extends EventEmitter {
  notify(options: NotifyOptions, callback?: NotifyCallback): this {
    const notifier = createNotifier();
    notifier
      .notify(options)
      .then((result) => {
        if (result.success) {
          this.emit("click", result);
        } else {
          this.emit("timeout", result);
        }
        if (callback) {
          callback(null, result);
        }
      })
      .catch((error: Error) => {
        this.emit("error", error);
        if (callback) {
          callback(error);
        }
      });
    return this;
  }
}

const defaultNotifier = new Notifier();

export default defaultNotifier;
