import { describe, it, expect } from "vitest";
import { escapePowerShellArg, escapeJxaArg } from "../src/utils/escape.js";

describe("escapePowerShellArg", () => {
  it("escapes backticks", () => {
    expect(escapePowerShellArg("hello`world")).toBe("hello``world");
  });

  it("escapes double quotes", () => {
    expect(escapePowerShellArg('say "hi"')).toBe('say `"hi`"');
  });

  it("escapes dollar signs", () => {
    expect(escapePowerShellArg("$var")).toBe("`$var");
  });

  it("escapes newlines", () => {
    expect(escapePowerShellArg("line1\nline2")).toBe("line1`nline2");
  });

  it("escapes carriage returns", () => {
    expect(escapePowerShellArg("line1\r\nline2")).toBe("line1`r`nline2");
  });

  it("handles empty string", () => {
    expect(escapePowerShellArg("")).toBe("");
  });

  it("handles combined special characters", () => {
    expect(escapePowerShellArg('`$"test"\n')).toBe('```$`"test`"`n');
  });
});

describe("escapeJxaArg", () => {
  it("escapes backslashes", () => {
    expect(escapeJxaArg("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("escapes double quotes", () => {
    expect(escapeJxaArg('say "hi"')).toBe('say \\"hi\\"');
  });

  it("escapes newlines", () => {
    expect(escapeJxaArg("line1\nline2")).toBe("line1\\nline2");
  });

  it("handles empty string", () => {
    expect(escapeJxaArg("")).toBe("");
  });

  it("handles combined characters", () => {
    expect(escapeJxaArg('path\\file "name"\nnewline')).toBe(
      'path\\\\file \\"name\\"\\nnewline'
    );
  });

  it("escapes carriage returns", () => {
    expect(escapeJxaArg("line1\rline2")).toBe("line1\\rline2");
  });

  it("handles unicode", () => {
    expect(escapeJxaArg("café")).toBe("café");
  });
});
