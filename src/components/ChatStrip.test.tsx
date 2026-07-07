import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { ChatStrip } from "./ChatStrip";
import { SkinContext } from "./ui/SkinContext";
import type { Chat } from "../types";

const makeChats = (n: number): Chat[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i),
    title: `Chat${i}`,
    unreadCount: 0,
    isGroup: false,
  }));

describe("ChatStrip", () => {
  it("shows a 3-chat window centered on the selection", () => {
    const frame =
      render(
        <ChatStrip chats={makeChats(6)} selectedIndex={3} selectedChatId="3" isFocused width={50} />
      ).lastFrame() ?? "";
    expect(frame).toContain("Chat2");
    expect(frame).toContain("Chat3");
    expect(frame).toContain("Chat4");
    expect(frame).not.toContain("Chat0");
    expect(frame).not.toContain("Chat5");
  });

  it("marks the active chat with ▸ and shows overflow affordances", () => {
    const frame =
      render(
        <ChatStrip chats={makeChats(6)} selectedIndex={3} selectedChatId="3" isFocused width={50} />
      ).lastFrame() ?? "";
    expect(frame).toContain("▸Chat3");
    expect(frame).toContain("‹");
    expect(frame).toContain("›");
  });

  it("omits the caret glyph before the active chat under the claudeCode skin (default skin keeps it)", () => {
    const frame =
      render(
        <SkinContext.Provider value="claudeCode">
          <ChatStrip chats={makeChats(6)} selectedIndex={3} selectedChatId="3" isFocused width={50} />
        </SkinContext.Provider>
      ).lastFrame() ?? "";
    expect(frame).toContain("Chat3");
    expect(frame).not.toContain("❯Chat3");
    expect(frame).not.toContain("❯");
  });

  it("renders a placeholder when there are no chats", () => {
    const frame =
      render(
        <ChatStrip chats={[]} selectedIndex={0} selectedChatId={null} isFocused width={50} />
      ).lastFrame() ?? "";
    expect(frame).toContain("No chats");
  });
});
