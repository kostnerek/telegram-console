import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { Box, Text, stripTextColor, stripBoxColor } from "./index";
import { ColorModeContext } from "./ColorModeContext";

// The test environment is non-TTY, so Ink emits no ANSI in lastFrame() and the
// color-stripping cannot be observed from rendered output. We therefore test the
// prop-stripping logic directly via the pure helpers, and use rendering only as a
// smoke test that the wrappers still produce correct text/border content.

describe("stripTextColor", () => {
  it("returns props unchanged when colors are enabled", () => {
    const props = { color: "red", backgroundColor: "blue", inverse: true, children: "x" } as const;
    expect(stripTextColor(props, false)).toBe(props);
  });

  it("drops color and backgroundColor but keeps formatting when monochrome", () => {
    const result = stripTextColor(
      { color: "red", backgroundColor: "blue", inverse: true, bold: true, dimColor: true, children: "x" },
      true,
    );
    expect("color" in result).toBe(false);
    expect("backgroundColor" in result).toBe(false);
    expect(result.inverse).toBe(true);
    expect(result.bold).toBe(true);
    expect(result.dimColor).toBe(true);
    expect(result.children).toBe("x");
  });
});

describe("stripBoxColor", () => {
  it("returns props unchanged when colors are enabled", () => {
    const props = { borderStyle: "round", borderColor: "cyan" } as const;
    expect(stripBoxColor(props, false)).toBe(props);
  });

  it("drops borderColor but keeps borderStyle when monochrome", () => {
    const result = stripBoxColor({ borderStyle: "round", borderColor: "cyan" }, true);
    expect("borderColor" in result).toBe(false);
    expect(result.borderStyle).toBe("round");
  });
});

describe("wrappers (render smoke tests)", () => {
  it("renders text content in both color modes", () => {
    expect(render(<Text color="red">hi</Text>).lastFrame()).toContain("hi");
    const mono =
      render(
        <ColorModeContext.Provider value={true}>
          <Text color="red">hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(mono).toContain("hi");
  });

  it("still draws the border when borderColor is dropped in monochrome", () => {
    const frame =
      render(
        <ColorModeContext.Provider value={true}>
          <Box borderStyle="round" borderColor="cyan">
            <Text>x</Text>
          </Box>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(frame).toContain("╭");
    expect(frame).toContain("x");
  });
});
