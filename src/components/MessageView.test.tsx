import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { MessageView } from "./MessageView";
import { AppProvider } from "../state/context";
import type { Message } from "../types";

const mockMessages: Message[] = [
  {
    id: 1,
    senderId: "user1",
    senderName: "Alice",
    text: "Hello there!",
    timestamp: new Date("2024-01-15T10:30:00"),
    isOutgoing: false,
  },
  {
    id: 2,
    senderId: "me",
    senderName: "You",
    text: "Hi Alice!",
    timestamp: new Date("2024-01-15T10:31:00"),
    isOutgoing: true,
  },
  {
    id: 3,
    senderId: "user1",
    senderName: "Alice",
    text: "How are you doing today?",
    timestamp: new Date("2024-01-15T10:32:00"),
    isOutgoing: false,
  },
];

const mockDispatch = () => {};
const mockSendReaction = async (_chatId: string, _messageId: number, _emoji: string) => true;
const mockRemoveReaction = async (_chatId: string, _messageId: number) => true;

function renderWithProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

describe("MessageView", () => {
  it("renders empty state when no chat selected", () => {
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={false}
        selectedChatTitle={null}
        messages={[]}
        selectedIndex={0}
        width={50}
        dispatch={mockDispatch}
        messageLayout="classic"
        isGroupChat={false}
        chatId={null}
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders empty state when focused", () => {
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={true}
        selectedChatTitle={null}
        messages={[]}
        selectedIndex={0}
        width={50}
        dispatch={mockDispatch}
        messageLayout="classic"
        isGroupChat={false}
        chatId={null}
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders messages when chat is selected", () => {
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={true}
        selectedChatTitle="Chat with Alice"
        messages={mockMessages}
        selectedIndex={0}
        width={50}
        dispatch={mockDispatch}
        messageLayout="classic"
        isGroupChat={false}
        chatId="chat1"
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders with unfocused state and messages", () => {
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={false}
        selectedChatTitle="Chat with Alice"
        messages={mockMessages}
        selectedIndex={1}
        width={50}
        dispatch={mockDispatch}
        messageLayout="classic"
        isGroupChat={false}
        chatId="chat1"
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
      />
    );
    expect(lastFrame()).toMatchSnapshot();
  });

  it("renders outgoing message with cyan sender name", () => {
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={true}
        selectedChatTitle="Chat with Alice"
        messages={mockMessages}
        selectedIndex={1}
        width={50}
        dispatch={mockDispatch}
        messageLayout="classic"
        isGroupChat={false}
        chatId="chat1"
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
      />
    );
    // Snapshot will capture the styling including cyan color for "You"
    expect(lastFrame()).toMatchSnapshot();
  });

  it("smaller height reduces the visible message window", () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      senderId: "u1",
      senderName: "Alice",
      text: `msg ${i}`,
      timestamp: new Date(0),
      isOutgoing: false,
    }));
    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused
        selectedChatTitle="Chat"
        messages={messages}
        selectedIndex={29}
        width={50}
        height={10}
        dispatch={() => {}}
        messageLayout="classic"
        isGroupChat={false}
        chatId="1"
        sendReaction={async () => true}
        removeReaction={async () => true}
      />,
    );
    const frame = lastFrame() ?? "";
    const shown = messages.filter((m) => frame.includes(m.text)).length;
    // height 10 → visibleLines 6; with a scroll-up indicator far fewer than 30 are shown
    expect(shown).toBeLessThan(30);
    expect(shown).toBeGreaterThan(0);
    // earlier messages are hidden, so the scroll-up indicator must appear
    expect(frame).toContain("earlier");
  });

  it("renders messages with reactions", () => {
    const messagesWithReactions: Message[] = [
      {
        id: 1,
        senderId: "user1",
        senderName: "Alice",
        text: "Hello there!",
        timestamp: new Date("2024-01-15T10:30:00"),
        isOutgoing: false,
        reactions: [
          { emoji: "👍", count: 2, hasUserReacted: false },
          { emoji: "❤️", count: 1, hasUserReacted: true },
        ],
      },
    ];

    const { lastFrame } = renderWithProvider(
      <MessageView
        isFocused={true}
        selectedChatTitle="Chat with Alice"
        messages={messagesWithReactions}
        selectedIndex={0}
        width={60}
        dispatch={mockDispatch}
        chatId="test-chat"
        sendReaction={mockSendReaction}
        removeReaction={mockRemoveReaction}
        messageLayout="classic"
        isGroupChat={false}
      />
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("👍");
    expect(frame).toContain("❤️");
  });
});
