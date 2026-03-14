import { describe, it, expect, vi, beforeEach } from "vitest";
import { _buildJxaScript } from "../src/platforms/macos.js";

// Mock child_process for NotificationCenter tests
vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
  execFileSync: vi.fn(),
}));

describe("buildJxaScript", () => {
  it("builds basic notification script", () => {
    const script = _buildJxaScript({ title: "Test", message: "Hello" });
    expect(script).toContain('withTitle: "Test"');
    expect(script).toContain('"Hello"');
    expect(script).toContain("displayNotification");
  });

  it("includes subtitle when provided", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "Hello",
      subtitle: "Sub",
    });
    expect(script).toContain('subtitle: "Sub"');
  });

  it("includes sound name when sound is string", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "Hello",
      sound: "Ping",
    });
    expect(script).toContain('soundName: "Ping"');
  });

  it("includes default sound when sound is true", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "Hello",
      sound: true,
    });
    expect(script).toContain('soundName: "default"');
  });

  it("omits sound when sound is false", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "Hello",
      sound: false,
    });
    expect(script).not.toContain("soundName");
  });

  it("escapes special characters in title", () => {
    const script = _buildJxaScript({
      title: 'Say "hello"',
      message: "Test",
    });
    expect(script).toContain('withTitle: "Say \\"hello\\""');
  });

  it("escapes newlines in message", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "line1\nline2",
    });
    expect(script).toContain('"line1\\nline2"');
  });

  it("escapes backslashes", () => {
    const script = _buildJxaScript({
      title: "Test",
      message: "path\\to\\file",
    });
    expect(script).toContain('"path\\\\to\\\\file"');
  });
});

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("calls osascript with JXA language flag", async () => {
    const { execFile } = await import("node:child_process");
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof execFile>;
      }
    );

    const { NotificationCenter } = await import(
      "../src/platforms/macos.js"
    );
    const nc = new NotificationCenter();
    const result = await nc.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(true);
    expect(mockedExecFile).toHaveBeenCalledWith(
      "osascript",
      ["-l", "JavaScript", "-e", expect.any(String)],
      expect.any(Function)
    );
  });

  it("returns failure on osascript error", async () => {
    const { execFile } = await import("node:child_process");
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(new Error("permission denied"));
        return {} as ReturnType<typeof execFile>;
      }
    );

    const { NotificationCenter } = await import(
      "../src/platforms/macos.js"
    );
    const nc = new NotificationCenter();
    const result = await nc.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("permission denied");
  });
});
