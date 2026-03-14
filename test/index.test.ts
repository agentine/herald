import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
  execFileSync: vi.fn(),
}));

vi.mock("node:os", () => ({
  platform: vi.fn(() => "darwin"),
}));

describe("notify()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("auto-detects platform and dispatches", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const { notify } = await import("../src/index.js");
    const result = await notify({ title: "Test", message: "Hello" });
    expect(result.success).toBe(true);
    expect(cp.execFile).toHaveBeenCalledWith(
      "osascript",
      expect.any(Array),
      expect.any(Function)
    );
  });

  it("returns failure on error", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(new Error("failed"));
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const { notify } = await import("../src/index.js");
    const result = await notify({ title: "Test", message: "Hello" });
    expect(result.success).toBe(false);
  });
});

describe("default export (node-notifier compat)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("has a notify method", async () => {
    const mod = await import("../src/index.js");
    expect(typeof mod.default.notify).toBe("function");
  });

  it("supports callback style", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const mod = await import("../src/index.js");
    const notifier = mod.default;

    const result = await new Promise<{
      error: Error | null;
      result?: import("../src/types.js").NotificationResult;
    }>((resolve) => {
      notifier.notify({ title: "Test", message: "Hello" }, (error, result) => {
        resolve({ error, result });
      });
    });

    expect(result.error).toBeNull();
    expect(result.result?.success).toBe(true);
  });

  it("emits click event on success", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const mod = await import("../src/index.js");
    const notifier = mod.default;

    const clickResult = await new Promise((resolve) => {
      notifier.on("click", resolve);
      notifier.notify({ title: "Test", message: "Hello" });
    });

    expect(clickResult).toEqual({ success: true });
  });

  it("emits timeout event on failure", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(new Error("oops"));
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const mod = await import("../src/index.js");
    const notifier = mod.default;

    const timeoutResult = await new Promise((resolve) => {
      notifier.on("timeout", resolve);
      notifier.notify({ title: "Test", message: "Hello" });
    });

    expect((timeoutResult as { success: boolean }).success).toBe(false);
  });

  it("returns this for chaining", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFile).mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const mod = await import("../src/index.js");
    const notifier = mod.default;
    const returned = notifier.notify({ title: "Test", message: "Hello" });
    expect(returned).toBe(notifier);
  });
});

describe("named exports", () => {
  it("exports NotificationCenter", async () => {
    const mod = await import("../src/index.js");
    expect(mod.NotificationCenter).toBeDefined();
  });

  it("exports WindowsBalloon", async () => {
    const mod = await import("../src/index.js");
    expect(mod.WindowsBalloon).toBeDefined();
  });

  it("exports NotifySend", async () => {
    const mod = await import("../src/index.js");
    expect(mod.NotifySend).toBeDefined();
  });

  it("exports FallbackChain", async () => {
    const mod = await import("../src/index.js");
    expect(mod.FallbackChain).toBeDefined();
  });

  it("exports notify function", async () => {
    const mod = await import("../src/index.js");
    expect(typeof mod.notify).toBe("function");
  });
});
