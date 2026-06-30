import { useContext, type ComponentProps } from "react";
import { Box as InkBox, Text as InkText } from "ink";
import { ColorModeContext } from "./ColorModeContext";

type TextProps = ComponentProps<typeof InkText>;
type BoxProps = ComponentProps<typeof InkBox>;

// Map the app's named colors to ansi256 grayscale shades (232=black … 255=white),
// preserving a rough brightness hierarchy so the UI stays readable without color.
// Brighter shades go to the "important" cues (focus/active/unread), dimmer to the rest.
const GRAY_BY_NAME: Record<string, string> = {
  cyan: "ansi256(255)", // focus / active / unread — brightest
  cyanBright: "ansi256(255)",
  white: "ansi256(252)",
  whiteBright: "ansi256(255)",
  blue: "ansi256(252)", // your messages
  green: "ansi256(250)",
  greenBright: "ansi256(252)",
  yellow: "ansi256(250)",
  yellowBright: "ansi256(252)",
  magenta: "ansi256(248)",
  magentaBright: "ansi256(250)",
  red: "ansi256(248)",
  redBright: "ansi256(250)",
  gray: "ansi256(244)",
  grey: "ansi256(244)",
};

const DEFAULT_GRAY = "ansi256(250)";

/**
 * Maps an Ink color value to a grayscale ansi256 shade. `undefined`/non-string
 * values pass through unchanged (so unset colors stay the terminal default).
 * Pure and side-effect free for easy testing.
 */
export function toGray(color: TextProps["color"]): TextProps["color"] {
  if (typeof color !== "string") return color;
  return GRAY_BY_NAME[color] ?? DEFAULT_GRAY;
}

/**
 * Returns the Text props to forward to Ink. In grayscale mode `color` is mapped
 * to a gray shade and `backgroundColor` is dropped; all formatting props
 * (inverse, bold, dimColor, …) are preserved.
 */
export function grayscaleTextProps(props: TextProps, grayscale: boolean): TextProps {
  if (!grayscale) return props;
  const { backgroundColor: _bg, ...rest } = props;
  return { ...rest, color: toGray(props.color) };
}

/**
 * Returns the Box props to forward to Ink. In grayscale mode `borderColor` is
 * mapped to a gray shade; all other props are preserved.
 */
export function grayscaleBoxProps(props: BoxProps, grayscale: boolean): BoxProps {
  if (!grayscale) return props;
  return { ...props, borderColor: toGray(props.borderColor) };
}

export function Text(props: TextProps) {
  const grayscale = useContext(ColorModeContext);
  return <InkText {...grayscaleTextProps(props, grayscale)} />;
}

export function Box(props: BoxProps) {
  const grayscale = useContext(ColorModeContext);
  return <InkBox {...grayscaleBoxProps(props, grayscale)} />;
}
