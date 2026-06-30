import { describe, it, expect } from "bun:test";
import { clearTerminal } from "./terminal";

describe("clearTerminal", () => {
  it("writes the clear-screen + clear-scrollback + home sequence", () => {
    let written = "";
    clearTerminal((s) => { written = s; });
    expect(written).toBe("\x1b[2J\x1b[3J\x1b[H");
  });
});
