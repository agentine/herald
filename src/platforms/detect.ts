import { platform } from "node:os";
import { execFileSync } from "node:child_process";

export type Platform = "darwin" | "win32" | "linux";

export function detectPlatform(): Platform {
  const p = platform();
  if (p === "darwin" || p === "win32" || p === "linux") return p;
  return "linux";
}

export function isToolAvailable(tool: string): boolean {
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    execFileSync(cmd, [tool], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export interface PlatformCapabilities {
  platform: Platform;
  tools: string[];
}

export function detectCapabilities(): PlatformCapabilities {
  const p = detectPlatform();
  const tools: string[] = [];

  switch (p) {
    case "darwin":
      if (isToolAvailable("osascript")) tools.push("osascript");
      break;
    case "win32":
      if (isToolAvailable("powershell")) tools.push("powershell");
      break;
    case "linux":
      if (isToolAvailable("notify-send")) tools.push("notify-send");
      if (isToolAvailable("gdbus")) tools.push("gdbus");
      break;
  }

  return { platform: p, tools };
}
