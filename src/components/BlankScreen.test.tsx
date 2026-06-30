import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { BlankScreen } from "./BlankScreen";

describe("BlankScreen", () => {
  it("renders BLANK ascii art using block characters", () => {
    const frame = render(<BlankScreen />).lastFrame() ?? "";
    expect(frame).toContain("█");
    expect(frame.trim().length).toBeGreaterThan(0);
  });
});
