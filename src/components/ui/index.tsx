import { useContext, type ComponentProps } from "react";
import { Box as InkBox, Text as InkText } from "ink";
import { ColorModeContext } from "./ColorModeContext";

type TextProps = ComponentProps<typeof InkText>;
type BoxProps = ComponentProps<typeof InkBox>;

/**
 * Returns the Text props to forward to Ink. In monochrome mode the `color` and
 * `backgroundColor` props are dropped; all formatting props (inverse, bold,
 * dimColor, …) are preserved. Pure and side-effect free for easy testing.
 */
export function stripTextColor(props: TextProps, noColor: boolean): TextProps {
  if (!noColor) return props;
  const { color: _c, backgroundColor: _bg, ...rest } = props;
  return rest;
}

/**
 * Returns the Box props to forward to Ink. In monochrome mode the `borderColor`
 * is dropped (the border characters still draw); all other props are preserved.
 */
export function stripBoxColor(props: BoxProps, noColor: boolean): BoxProps {
  if (!noColor) return props;
  const { borderColor: _b, ...rest } = props;
  return rest;
}

export function Text(props: TextProps) {
  const noColor = useContext(ColorModeContext);
  return <InkText {...stripTextColor(props, noColor)} />;
}

export function Box(props: BoxProps) {
  const noColor = useContext(ColorModeContext);
  return <InkBox {...stripBoxColor(props, noColor)} />;
}
