import { describe, it, expect } from "vitest";
import { escapeShellArg, escapePowerShellArg, escapeJxaArg } from "../src/utils/escape.js";

describe("escapeShellArg", () => {
  it("wraps a simple string in single quotes", () => {
    expect(escapeShellArg("hello")).toBe("'hello'");
  });

  it("escapes embedded single quotes", () => {
    expect(escapeShellArg("it's")).toBe("'it'\\''s'");
  });

  it("handles empty string", () => {
    expect(escapeShellArg("")).toBe("''");
  });

  it("handles strings with spaces", () => {
    expect(escapeShellArg("hello world")).toBe("'hello world'");
  });

  it("handles special characters without escaping them", () => {
    expect(escapeShellArg('$HOME "test" `cmd`')).toBe("'$HOME \"test\" `cmd`'");
  });

  it("handles newlines", () => {
    expect(escapeShellArg("line1\nline2")).toBe("'line1\nline2'");
  });

  it("handles multiple single quotes", () => {
    expect(escapeShellArg("a'b'c")).toBe("'a'\\''b'\\''c'");
  });

  it("handles unicode characters", () => {
    expect(escapeShellArg("héllo wörld")).toBe("'héllo wörld'");
  });

  it("handles backslashes", () => {
    expect(escapeShellArg("path\\to\\file")).toBe("'path\\to\\file'");
  });
});

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

  it("handles unicode", () => {
    expect(escapeJxaArg("café")).toBe("café");
  });
});
