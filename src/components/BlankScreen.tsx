import { memo } from "react";
import { Box, Text } from "./ui";

const BLANK_ART = [
  "██████  ██       █████  ███    ██ ██   ██",
  "██   ██ ██      ██   ██ ████   ██ ██  ██ ",
  "██████  ██      ███████ ██ ██  ██ █████  ",
  "██   ██ ██      ██   ██ ██  ██ ██ ██  ██ ",
  "██████  ███████ ██   ██ ██   ████ ██   ██",
];

function BlankScreenInner() {
  return (
    <Box
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      {BLANK_ART.map((line, i) => (
        <Text key={i} dimColor>
          {line}
        </Text>
      ))}
    </Box>
  );
}

export const BlankScreen = memo(BlankScreenInner);
