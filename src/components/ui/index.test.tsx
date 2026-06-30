import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import chalk from "chalk";
import { Box, Text } from "./index";
import { ColorModeContext } from "./ColorModeContext";

// Force chalk to emit ANSI in the (non-TTY) test env so we can assert color
// presence/absence. Restore afterward so other test files' snapshots are unaffected.
let originalLevel: typeof chalk.level;
beforeAll(() => { originalLevel = chalk.level; chalk.level = 3; });
afterAll(() => { chalk.level = originalLevel; });

describe("color-mode wrappers", () => {
  it("emits color when context is false (default)", () => {
    const frame = render(<Text color="red">hi</Text>).lastFrame() ?? "";
    expect(frame).toContain("hi");
    expect(/\[31m/.test(frame)).toBe(true); // red foreground present
  });

  it("strips color when context is true but keeps inverse", () => {
    const plain =
      render(
        <ColorModeContext.Provider value={true}>
          <Text color="red">hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(plain).toContain("hi");
    expect(/\[31m/.test(plain)).toBe(false); // no red

    const inv =
      render(
        <ColorModeContext.Provider value={true}>
          <Text inverse>hi</Text>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(/\[7m/.test(inv)).toBe(true); // inverse modifier survives
  });

  it("Box drops borderColor in mono but still draws the border", () => {
    const colored =
      render(
        <Box borderStyle="round" borderColor="cyan">
          <Text>x</Text>
        </Box>
      ).lastFrame() ?? "";
    expect(/\[36m/.test(colored)).toBe(true); // cyan border present

    const mono =
      render(
        <ColorModeContext.Provider value={true}>
          <Box borderStyle="round" borderColor="cyan">
            <Text>x</Text>
          </Box>
        </ColorModeContext.Provider>
      ).lastFrame() ?? "";
    expect(mono).toContain("╭"); // border characters still drawn
    expect(/\[36m/.test(mono)).toBe(false); // but no cyan color code
  });
});
