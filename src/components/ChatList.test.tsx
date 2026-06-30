import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { ChatList } from "./ChatList";
import type { Chat } from "../types";

const mockChats: Chat[] = [
  {
    id: "1",
    title: "John Doe",
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: "2",
    title: "Jane Smith",
    unreadCount: 3,
    isGroup: false,
  },
  {
    id: "3",
    title: "Work Group",
    unreadCount: 0,
    isGroup: true,
  },
];

describe("ChatList", () => {
  it("renders correctly when focused", () => {
    const { lastFrame } = render(
      <ChatList
        chats={mockChats}
        selectedChatId="1"
        onSelectChat={() => {}}
        selectedIndex={0}
        isFocused={true}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders correctly when unfocused", () => {
    const { lastFrame } = render(
      <ChatList
        chats={mockChats}
        selectedChatId="1"
        onSelectChat={() => {}}
        selectedIndex={0}
        isFocused={false}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders chat with unread indicator in cyan", () => {
    const { lastFrame } = render(
      <ChatList
        chats={mockChats}
        selectedChatId="2"
        onSelectChat={() => {}}
        selectedIndex={1}
        isFocused={true}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders empty chat list", () => {
    const { lastFrame } = render(
      <ChatList
        chats={[]}
        selectedChatId={null}
        onSelectChat={() => {}}
        selectedIndex={0}
        isFocused={true}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("smaller height shows fewer chat rows", () => {
    const chats = Array.from({ length: 40 }, (_, i) => ({
      id: String(i),
      title: `Chat ${i}`,
      unreadCount: 0,
      isGroup: false,
    }));
    const { lastFrame } = render(
      <ChatList chats={chats} selectedChatId={null} onSelectChat={() => {}} selectedIndex={0} isFocused height={12} />,
    );
    const frame = lastFrame() ?? "";
    const rowCount = chats.filter((c) => frame.includes(c.title)).length;
    // height 12 → LIST_HEIGHT 6 visible rows, far fewer than 40
    expect(rowCount).toBeLessThanOrEqual(6);
    expect(rowCount).toBeGreaterThan(0);
  });

  it("renders the container at the given width", () => {
    const chats = [{ id: "1", title: "Alpha", unreadCount: 0, isGroup: false }];
    const wide = render(
      <ChatList chats={chats} selectedChatId={null} onSelectChat={() => {}} selectedIndex={0} isFocused={false} />
    ).lastFrame() ?? "";
    expect(wide.split("\n")[0]!.length).toBe(35); // default width

    const narrowBox = render(
      <ChatList chats={chats} selectedChatId={null} onSelectChat={() => {}} selectedIndex={0} isFocused={false} width={20} />
    ).lastFrame() ?? "";
    expect(narrowBox.split("\n")[0]!.length).toBe(20);
  });
});
