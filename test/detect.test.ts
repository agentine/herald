import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

vi.mock("node:os", () => ({
  platform: vi.fn(),
}));

describe("detectPlatform", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns darwin for macOS", async () => {
    const os = await import("node:os");
    vi.mocked(os.platform).mockReturnValue("darwin");
    const { detectPlatform } = await import("../src/platforms/detect.js");
    expect(detectPlatform()).toBe("darwin");
  });

  it("returns win32 for Windows", async () => {
    const os = await import("node:os");
    vi.mocked(os.platform).mockReturnValue("win32");
    const { detectPlatform } = await import("../src/platforms/detect.js");
    expect(detectPlatform()).toBe("win32");
  });

  it("returns linux for Linux", async () => {
    const os = await import("node:os");
    vi.mocked(os.platform).mockReturnValue("linux");
    const { detectPlatform } = await import("../src/platforms/detect.js");
    expect(detectPlatform()).toBe("linux");
  });

  it("returns linux for unknown platforms", async () => {
    const os = await import("node:os");
    vi.mocked(os.platform).mockReturnValue("freebsd");
    const { detectPlatform } = await import("../src/platforms/detect.js");
    expect(detectPlatform()).toBe("linux");
  });
});

describe("isToolAvailable", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns true when tool is found", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFileSync).mockReturnValue(Buffer.from("/usr/bin/osascript"));
    const { isToolAvailable } = await import("../src/platforms/detect.js");
    expect(isToolAvailable("osascript")).toBe(true);
  });

  it("returns false when tool is not found", async () => {
    const cp = await import("node:child_process");
    vi.mocked(cp.execFileSync).mockImplementation(() => {
      throw new Error("not found");
    });
    const { isToolAvailable } = await import("../src/platforms/detect.js");
    expect(isToolAvailable("nonexistent")).toBe(false);
  });
});
