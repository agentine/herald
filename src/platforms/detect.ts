import { platform } from "node:os";

export type Platform = "darwin" | "win32" | "linux";

export function detectPlatform(): Platform {
  const p = platform();
  if (p === "darwin" || p === "win32" || p === "linux") return p;
  return "linux";
}
