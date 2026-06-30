import { memo } from "react";
import { Box, Text } from "./ui";
import type { Chat } from "../types";

const WINDOW = 3;
const TITLE_MAX = 12;

interface ChatStripProps {
  chats: Chat[];
  selectedIndex: number;
  selectedChatId: string | null;
  isFocused: boolean;
  width: number;
}

function ChatStripInner({ chats, selectedIndex, selectedChatId, isFocused }: ChatStripProps) {
  const total = chats.length;
  if (total === 0) {
    return (
      <Box paddingX={1}>
        <Text dimColor>No chats</Text>
      </Box>
    );
  }

  let start = Math.max(0, selectedIndex - Math.floor(WINDOW / 2));
  start = Math.min(start, Math.max(0, total - WINDOW));
  const end = Math.min(total, start + WINDOW);
  const windowChats = chats.slice(start, end);

  return (
    <Box paddingX={1}>
      <Text dimColor>{start > 0 ? "‹ " : "  "}</Text>
      {windowChats.map((chat, i) => {
        const globalIndex = start + i;
        const isHighlighted = isFocused && globalIndex === selectedIndex;
        const isActive = chat.id === selectedChatId;
        const hasUnread = chat.unreadCount > 0;
        const prefix = isActive ? "▸" : chat.isGroup ? "#" : "";
        const title = chat.title.slice(0, TITLE_MAX);
        const isLast = i === windowChats.length - 1;
        return (
          <Text key={chat.id}>
            <Text
              inverse={isHighlighted}
              bold={isActive || hasUnread}
              color={isActive || hasUnread ? "cyan" : undefined}
            >
              {prefix}
              {title}
            </Text>
            {!isLast && <Text dimColor> · </Text>}
          </Text>
        );
      })}
      <Text dimColor>{end < total ? " ›" : ""}</Text>
    </Box>
  );
}

export const ChatStrip = memo(ChatStripInner);
