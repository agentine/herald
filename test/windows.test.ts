import { describe, it, expect, vi, beforeEach } from "vitest";
import { _buildPowerShellScript } from "../src/platforms/windows.js";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
}));

describe("buildPowerShellScript", () => {
  it("builds script with title and message", () => {
    const script = _buildPowerShellScript({ title: "Test", message: "Hello" });
    expect(script).toContain("Test");
    expect(script).toContain("Hello");
  });

  it("includes BurntToast path", () => {
    const script = _buildPowerShellScript({ title: "T", message: "M" });
    expect(script).toContain("BurntToast");
    expect(script).toContain("New-BurntToastNotification");
  });

  it("includes WinRT fallback", () => {
    const script = _buildPowerShellScript({ title: "T", message: "M" });
    expect(script).toContain("ToastNotificationManager");
  });

  it("uses custom appId", () => {
    const script = _buildPowerShellScript({
      title: "T",
      message: "M",
      appId: "com.test.app",
    });
    expect(script).toContain("com.test.app");
  });

  it("defaults appId to herald", () => {
    const script = _buildPowerShellScript({ title: "T", message: "M" });
    expect(script).toContain('"herald"');
  });

  it("adds -Silent when sound is false", () => {
    const script = _buildPowerShellScript({
      title: "T",
      message: "M",
      sound: false,
    });
    expect(script).toContain("-Silent");
  });

  it("omits -Silent when sound is not false", () => {
    const script = _buildPowerShellScript({
      title: "T",
      message: "M",
      sound: true,
    });
    expect(script).not.toContain("-Silent");
  });

  it("escapes special PowerShell characters", () => {
    const script = _buildPowerShellScript({
      title: '$var "quoted"',
      message: "hello`world",
    });
    expect(script).toContain("`$var");
    expect(script).toContain('`"quoted`"');
    expect(script).toContain("``world");
  });
});

describe("WindowsBalloon", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("calls powershell with correct flags", async () => {
    const { execFile } = await import("node:child_process");
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(null);
        return {} as ReturnType<typeof execFile>;
      }
    );

    const { WindowsBalloon } = await import("../src/platforms/windows.js");
    const wb = new WindowsBalloon();
    const result = await wb.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(true);
    expect(mockedExecFile).toHaveBeenCalledWith(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", expect.any(String)],
      expect.any(Function)
    );
  });

  it("returns failure on error", async () => {
    const { execFile } = await import("node:child_process");
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, cb: unknown) => {
        (cb as (err: Error | null) => void)(new Error("powershell failed"));
        return {} as ReturnType<typeof execFile>;
      }
    );

    const { WindowsBalloon } = await import("../src/platforms/windows.js");
    const wb = new WindowsBalloon();
    const result = await wb.notify({ title: "Test", message: "Hello" });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("powershell failed");
  });
});
