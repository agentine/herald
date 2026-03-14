import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";

export class NotificationCenter implements INotifier {
  async notify(_options: NotifyOptions): Promise<NotificationResult> {
    throw new Error("Not implemented");
  }
}
