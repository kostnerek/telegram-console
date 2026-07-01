import React, { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { Box, Text } from './ui';
import type { Message } from '../types/index.js';
import { getMediaBuffer } from '../services/mediaCache.js';
import { renderPanelImage, formatMediaMetadata } from '../services/imageRenderer.js';
import { supportsKittyGraphics, buildKittyImage, clearKittyImage } from '../services/kittyImage.js';

// Panel chrome: border(2) + header(1) + marginBottom(1) + marginTop(1) + metadata(1) + hint(1) = 7 rows
// Plus 1 for bottom border inner = 8 total non-image rows
const PANEL_CHROME_ROWS = 8;
const MIN_IMAGE_HEIGHT = 4;

interface Props {
  message: Message;
  panelWidth: number;
  panelHeight: number;
  downloadMedia: (message: Message) => Promise<Buffer | undefined>;
  onClose: () => void;
  isFocused?: boolean;
}

export function MediaPanel({ message, panelWidth, panelHeight, downloadMedia, onClose, isFocused = true }: Props) {
  const messageId = message.id;
  const media = message.media!;

  const imageMaxHeight = Math.max(MIN_IMAGE_HEIGHT, panelHeight - PANEL_CHROME_ROWS);

  // Skip panel image cache - dimensions may have changed, always re-render
  // Buffer cache still prevents re-downloads
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle Enter/Escape to close
  useInput((input, key) => {
    if (key.return || key.escape) {
      onClose();
    }
  }, { isActive: isFocused });

  useEffect(() => {
    let cancelled = false;
    let transmittedKitty = false;

    (async () => {
      try {
        const buffer = await getMediaBuffer(messageId, () => downloadMedia(message));
        if (cancelled || !buffer) {
          if (!cancelled && !buffer) {
            setError('Failed to download');
            setLoading(false);
          }
          return;
        }

        // Crisp path: Kitty graphics via Unicode placeholders (Ghostty, iTerm 3.6+).
        // The image is transmitted to the terminal once, then rendered as a grid of
        // placeholder characters that Ink draws as text — the terminal paints the
        // real image over them. Falls back to ANSI half-blocks elsewhere.
        if (supportsKittyGraphics()) {
          const contentWidth = panelWidth - 4; // border(2) + paddingX(2)
          const { control, grid } = await buildKittyImage(buffer, contentWidth, imageMaxHeight);
          if (cancelled) return;
          process.stdout.write(control);
          transmittedKitty = true;
          setImage(grid);
          setLoading(false);
          return;
        }

        const rendered = await renderPanelImage(buffer, panelWidth, imageMaxHeight);
        if (cancelled) return;

        setImage(rendered);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (transmittedKitty) process.stdout.write(clearKittyImage());
    };
  }, [messageId, message, downloadMedia, panelWidth, imageMaxHeight]);

  const metadata = formatMediaMetadata(media, messageId);

  const focusColor = isFocused ? 'cyan' : 'blue';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={focusColor}
      width={panelWidth}
      height={panelHeight}
      paddingX={1}
    >
      <Box marginBottom={1}>
        <Text bold color={focusColor}>Media</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center">
        {loading && <Text dimColor>Loading...</Text>}
        {error && <Text color="red">⚠ {error}</Text>}
        {image && <Text>{image}</Text>}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>{metadata}</Text>
        <Text dimColor>Enter/Esc to close</Text>
      </Box>
    </Box>
  );
}
