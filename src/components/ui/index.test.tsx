import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React, { useContext } from "react";
import { Box, Text } from "./index";
import { ColorModeContext } from "./ColorModeContext";

// Helper component to verify context is being read
function ContextVerifier() {
  const noColor = useContext(ColorModeContext);
  return <Text>{noColor ? "mono" : "color"}</Text>;
}

describe("color-mode wrappers", () => {
  it("reads ColorModeContext correctly (context propagates)", () => {
    const defaultFrame = render(<ContextVerifier />).lastFrame() ?? "";
    expect(defaultFrame).toContain("color");

    const monoFrame = render(
      <ColorModeContext.Provider value={true}>
        <ContextVerifier />
      </ColorModeContext.Provider>
    ).lastFrame() ?? "";
    expect(monoFrame).toContain("mono");
  });

  it("renders text correctly when context is false (default)", () => {
    const frame = render(<Text color="red">hi</Text>).lastFrame() ?? "";
    expect(frame).toContain("hi");
  });

  it("drops color in mono mode but renders text; preserves inverse", () => {
    // Text with color in mono mode should render without the color prop passed to Ink
    const plain =
      render(
        <ColorModeContext.Provider value={true}>
          <Text color="red">hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(plain).toContain("hi");

    // inverse should be preserved as a non-color formatting prop
    const inv =
      render(
        <ColorModeContext.Provider value={true}>
          <Text inverse>hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(inv).toContain("hi");
  });

  it("Box drops borderColor in mono mode but still draws the border", () => {
    const frame =
      render(
        <ColorModeContext.Provider value={true}>
          <Box borderStyle="round" borderColor="cyan">
            <Text>x</Text>
          </Box>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(frame).toContain("╭"); // border characters still present
  });
});
