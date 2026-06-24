import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render } from "ink-testing-library";
import React from "react";
import { App } from "./app";
import { AppProvider } from "./state/context";
import { createMockTelegramService } from "./services/telegram.mock";
import { MainApp } from "./app";

describe("App Integration", () => {
  it("renders without crashing in mock mode", () => {
    const { lastFrame } = render(<App useMock />);
    expect(lastFrame()).toBeDefined();
  });

  it("shows setup screen when no config exists", () => {
    const { lastFrame } = render(<App useMock />);
    const frame = lastFrame();
    // Without config, Setup is shown first (which contains "Welcome to telegram-console!")
    // WelcomeSplash is shown after setup completes
    expect(frame).toContain("Welcome to telegram-console");
  });
});

describe("MainApp minimal UI mode", () => {
  let mockService: ReturnType<typeof createMockTelegramService>;

  beforeEach(() => {
    mockService = createMockTelegramService();
  });

  afterEach(async () => {
    await mockService.disconnect();
  });

  it("full mode renders header and status chrome", async () => {
    const { lastFrame } = render(
      <AppProvider telegramService={mockService} initialUiMode="full">
        <MainApp telegramService={mockService} onLogout={() => {}} />
      </AppProvider>
    );
    // Wait for async connect + chats to load
    await new Promise((r) => setTimeout(r, 200));
    const frame = lastFrame() ?? "";
    expect(frame).toContain("telegram-console");
    expect(frame).toMatch(/Connected|Tab: Next|Esc: Back/);
  });

  it("pressing m switches to minimal mode and hides chrome", async () => {
    const { lastFrame, stdin } = render(
      <AppProvider telegramService={mockService} initialUiMode="full">
        <MainApp telegramService={mockService} onLogout={() => {}} />
      </AppProvider>
    );
    // Wait for chats to load (connect resolves after ~100ms in mock)
    await new Promise((r) => setTimeout(r, 200));
    // Send 'm' to toggle minimal mode (focused panel is chatList, not input)
    stdin.write("m");
    await new Promise((r) => setTimeout(r, 50));
    const frame = lastFrame() ?? "";
    expect(frame).not.toContain("telegram-console");
    expect(frame).not.toContain("[Logout]");
  });
});
