import { useContext, type ComponentProps } from "react";
import { Box as InkBox, Text as InkText } from "ink";
import { ColorModeContext } from "./ColorModeContext";

export function Text(props: ComponentProps<typeof InkText>) {
  const noColor = useContext(ColorModeContext);
  if (!noColor) return <InkText {...props} />;
  const { color: _c, backgroundColor: _bg, ...rest } = props;
  return <InkText {...rest} />;
}

export function Box(props: ComponentProps<typeof InkBox>) {
  const noColor = useContext(ColorModeContext);
  if (!noColor) return <InkBox {...props} />;
  const { borderColor: _b, ...rest } = props;
  return <InkBox {...rest} />;
}
