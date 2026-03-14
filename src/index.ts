export type { NotifyOptions, NotificationResult, INotifier } from "./types.js";
export { NotificationCenter } from "./platforms/macos.js";
export { WindowsBalloon } from "./platforms/windows.js";
export { NotifySend } from "./platforms/linux.js";
export { FallbackChain } from "./utils/fallback.js";

import type { NotifyOptions, NotificationResult } from "./types.js";

export async function notify(_options: NotifyOptions): Promise<NotificationResult> {
  throw new Error("Not implemented");
}
