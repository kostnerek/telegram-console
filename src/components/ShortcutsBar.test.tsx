import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { ShortcutsBar } from "./ShortcutsBar";

describe("ShortcutsBar", () => {
  it("renders the shortcut legend", () => {
    const frame = render(<ShortcutsBar />).lastFrame() ?? "";
    expect(frame).toContain("m minimal");
    expect(frame).toContain("c colors");
    expect(frame).toContain("Tab cycle");
  });
});
