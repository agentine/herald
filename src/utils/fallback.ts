import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";

export class FallbackChain implements INotifier {
  private readonly strategies: INotifier[];

  constructor(strategies: INotifier[]) {
    this.strategies = strategies;
  }

  async notify(options: NotifyOptions): Promise<NotificationResult> {
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.notify(options);
        if (result.success) return result;
      } catch {
        continue;
      }
    }
    return { success: false, error: new Error("No notification strategy succeeded") };
  }
}
