import { describe, it, expect } from "vitest";
import { FallbackChain } from "../src/utils/fallback.js";
import type { INotifier, NotifyOptions, NotificationResult } from "../src/types.js";

function makeNotifier(result: NotificationResult): INotifier {
  return { notify: async () => result };
}

function makeThrowingNotifier(message: string): INotifier {
  return {
    notify: async () => {
      throw new Error(message);
    },
  };
}

const opts: NotifyOptions = { title: "Test", message: "Hello" };

describe("FallbackChain", () => {
  it("returns first successful result", async () => {
    const chain = new FallbackChain([
      makeNotifier({ success: true, action: "first" }),
      makeNotifier({ success: true, action: "second" }),
    ]);
    const result = await chain.notify(opts);
    expect(result.success).toBe(true);
    expect(result.action).toBe("first");
  });

  it("falls back when first strategy fails", async () => {
    const chain = new FallbackChain([
      makeNotifier({ success: false }),
      makeNotifier({ success: true, action: "second" }),
    ]);
    const result = await chain.notify(opts);
    expect(result.success).toBe(true);
    expect(result.action).toBe("second");
  });

  it("falls back when first strategy throws", async () => {
    const chain = new FallbackChain([
      makeThrowingNotifier("oops"),
      makeNotifier({ success: true, action: "fallback" }),
    ]);
    const result = await chain.notify(opts);
    expect(result.success).toBe(true);
    expect(result.action).toBe("fallback");
  });

  it("returns failure when all strategies fail", async () => {
    const chain = new FallbackChain([
      makeNotifier({ success: false }),
      makeThrowingNotifier("broken"),
    ]);
    const result = await chain.notify(opts);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("returns failure with empty chain", async () => {
    const chain = new FallbackChain([]);
    const result = await chain.notify(opts);
    expect(result.success).toBe(false);
  });

  it("passes options to each strategy", async () => {
    const received: NotifyOptions[] = [];
    const recorder: INotifier = {
      notify: async (o) => {
        received.push(o);
        return { success: true };
      },
    };
    const chain = new FallbackChain([
      makeNotifier({ success: false }),
      recorder,
    ]);
    await chain.notify(opts);
    expect(received).toEqual([opts]);
  });
});
