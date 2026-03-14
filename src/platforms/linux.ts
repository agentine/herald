import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";

export class NotifySend implements INotifier {
  async notify(_options: NotifyOptions): Promise<NotificationResult> {
    throw new Error("Not implemented");
  }
}
