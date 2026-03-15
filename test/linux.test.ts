import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  _buildNotifySendArgs,
  _buildDBusArgs,
} from "../src/platforms/linux.js";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
  execFileSync: vi.fn(),
}));

vi.mock("node:os", () => ({
  platform: vi.fn(() => "linux"),
}));

describe("buildNotifySendArgs", () => {
  it("builds basic args with title and message", () => {
    const args = _buildNotifySendArgs({ title: "Test", message: "Hello" });
    expect(args).toEqual(["Test", "Hello"]);
  });

  it("includes urgency flag", () => {
    const args = _buildNotifySendArgs({
      title: "T",
      message: "M",
      urgency: "critical",
    });
    expect(args).toContain("--urgency");
    expect(args).toContain("critical");
  });

  it("includes icon flag", () => {
    const args = _buildNotifySendArgs({
      title: "T",
      message: "M",
      icon: "/path/icon.png",
    });
    expect(args).toContain("--icon");
    expect(args).toContain("/path/icon.png");
  });

  it("converts timeout to milliseconds", () => {
    const args = _buildNotifySendArgs({
      title: "T",
      message: "M",
      timeout: 5,
    });
    expect(args).toContain("--expire-time");
    expect(args).toContain("5000");
  });

  it("includes actions", () => {
    const args = _buildNotifySendArgs({
      title: "T",
      message: "M",
      actions: ["View", "Dismiss"],
    });
    expect(args).toContain("--action=view=View");
    expect(args).toContain("--action=dismiss=Dismiss");
  });

  it("title and message are always last", () => {
    const args = _buildNotifySendArgs({
      title: "Title",
      message: "Body",
      urgency: "low",
    });
    expect(args[args.length - 2]).toBe("Title");
    expect(args[args.length - 1]).toBe("Body");
  });
});

describe("buildDBusArgs", () => {
  it("builds correct D-Bus call args", () => {
    const args = _buildDBusArgs({ title: "Test", message: "Hello" });
    expect(args[0]).toBe("call");
    expect(args).toContain("--session");
    expect(args).toContain("--dest=org.freedesktop.Notifications");
    expect(args).toContain("--method=org.freedesktop.Notifications.Notify");
    expect(args).toContain("Test");
    expect(args).toContain("Hello");
  });

  it("uses icon when provided", () => {
    const args = _buildDBusArgs({
      title: "T",
      message: "M",
      icon: "/icon.png",
    });
    expect(args[args.indexOf("T") - 1]).toBe("/icon.png");
  });

  it("defaults icon to empty string", () => {
    const args = _buildDBusArgs({ title: "T", message: "M" });
    expect(args).toContain("");
  });

  it("converts timeout to milliseconds", () => {
    const args = _buildDBusArgs({ title: "T", message: "M", timeout: 10 });
    expect(args[args.length - 1]).toBe("10000");
  });

  it("uses -1 for no timeout", () => {
    const args = _buildDBusArgs({ title: "T", message: "M" });
    expect(args[args.length - 1]).toBe("-1");
  });
});

describe("NotifySend", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("calls notify-send when available", async () => {
    const cp = await import("node:child_process");
    const mockedExecFile = vi.mocked(cp.execFile);
    const mockedExecFileSync = vi.mocked(cp.execFileSync);

    // isToolAvailable: notify-send found
    mockedExecFileSync.mockReturnValue(Buffer.from("/usr/bin/notify-send"));
    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const { NotifySend } = await import("../src/platforms/linux.js");
    const ns = new NotifySend();
    const result = await ns.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(true);
    expect(mockedExecFile).toHaveBeenCalledWith(
      "notify-send",
      expect.any(Array),
      expect.any(Function)
    );
  });

  it("falls back to gdbus when notify-send unavailable", async () => {
    const cp = await import("node:child_process");
    const mockedExecFile = vi.mocked(cp.execFile);
    const mockedExecFileSync = vi.mocked(cp.execFileSync);

    mockedExecFileSync.mockImplementation((_cmd: unknown, args: unknown) => {
      const argArray = args as string[];
      if (argArray[0] === "notify-send") throw new Error("not found");
      return Buffer.from("/usr/bin/gdbus");
    });

    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof cp.execFile>;
      }
    );

    const { NotifySend } = await import("../src/platforms/linux.js");
    const ns = new NotifySend();
    const result = await ns.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(true);
    expect(mockedExecFile).toHaveBeenCalledWith(
      "gdbus",
      expect.any(Array),
      expect.any(Function)
    );
  });

  it("returns failure when no tools available", async () => {
    const cp = await import("node:child_process");
    const mockedExecFileSync = vi.mocked(cp.execFileSync);
    mockedExecFileSync.mockImplementation(() => {
      throw new Error("not found");
    });

    const { NotifySend } = await import("../src/platforms/linux.js");
    const ns = new NotifySend();
    const result = await ns.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain("No notification tool available");
  });
});
