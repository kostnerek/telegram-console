import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { Box, Text, toGray, grayscaleTextProps, grayscaleBoxProps } from "./index";
import { ColorModeContext } from "./ColorModeContext";

// The test environment is non-TTY, so Ink emits no ANSI in lastFrame() and the
// color mapping cannot be observed from rendered output. We therefore test the
// pure prop-mapping logic directly, and use rendering only as a smoke test that
// the wrappers still produce correct text/border content.

describe("toGray", () => {
  it("passes through undefined (unset color stays terminal default)", () => {
    expect(toGray(undefined)).toBeUndefined();
  });

  it("maps known colors to ansi256 gray shades", () => {
    expect(toGray("cyan")).toBe("ansi256(255)");
    expect(toGray("gray")).toBe("ansi256(244)");
    // brightness hierarchy: focus cyan is lighter than the gray accent
    expect(toGray("cyan")).not.toBe(toGray("gray"));
  });

  it("maps unknown colors (hex/rgb) to a default mid gray", () => {
    expect(toGray("#ff8800")).toBe("ansi256(250)");
  });
});

describe("grayscaleTextProps", () => {
  it("returns props unchanged when grayscale is off", () => {
    const props = { color: "red", backgroundColor: "blue", inverse: true, children: "x" } as const;
    expect(grayscaleTextProps(props, false)).toBe(props);
  });

  it("maps color to gray, drops backgroundColor, keeps formatting when grayscale", () => {
    const result = grayscaleTextProps(
      { color: "cyan", backgroundColor: "blue", inverse: true, bold: true, dimColor: true, children: "x" },
      true,
    );
    expect(result.color).toBe("ansi256(255)");
    expect("backgroundColor" in result).toBe(false);
    expect(result.inverse).toBe(true);
    expect(result.bold).toBe(true);
    expect(result.dimColor).toBe(true);
    expect(result.children).toBe("x");
  });
});

describe("grayscaleBoxProps", () => {
  it("returns props unchanged when grayscale is off", () => {
    const props = { borderStyle: "round", borderColor: "cyan" } as const;
    expect(grayscaleBoxProps(props, false)).toBe(props);
  });

  it("maps borderColor to gray but keeps borderStyle when grayscale", () => {
    const result = grayscaleBoxProps({ borderStyle: "round", borderColor: "cyan" }, true);
    expect(result.borderColor).toBe("ansi256(255)");
    expect(result.borderStyle).toBe("round");
  });
});

describe("wrappers (render smoke tests)", () => {
  it("renders text content in both color modes", () => {
    expect(render(<Text color="red">hi</Text>).lastFrame()).toContain("hi");
    const gray =
      render(
        <ColorModeContext.Provider value={true}>
          <Text color="red">hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(gray).toContain("hi");
  });

  it("still draws the border in grayscale mode", () => {
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
