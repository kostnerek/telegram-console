import { memo } from "react";
import { Box, Text } from "./ui";

function ShortcutsBarInner() {
  return (
    <Box paddingX={1}>
      <Text dimColor wrap="truncate">
        Tab cycle · m minimal · h hide · c colors · s settings · l logout
      </Text>
    </Box>
  );
}

export const ShortcutsBar = memo(ShortcutsBarInner);
