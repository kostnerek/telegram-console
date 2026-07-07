import { describe, it, expect } from "bun:test";
import {
  isNarrowLayout,
  getChatListWidth,
  getMessageViewWidth,
  NARROW_THRESHOLD,
} from "./layout";

describe("layout helpers", () => {
  it("isNarrowLayout flips at the threshold", () => {
    expect(isNarrowLayout(NARROW_THRESHOLD - 1)).toBe(true);
    expect(isNarrowLayout(NARROW_THRESHOLD)).toBe(false);
    expect(isNarrowLayout(100)).toBe(false);
  });

  it("getChatListWidth caps at 35 and shrinks with a floor of width-30", () => {
    expect(getChatListWidth(100)).toBe(35);
    expect(getChatListWidth(60)).toBe(30);
  });

  it("getMessageViewWidth gives full width when narrow", () => {
    expect(getMessageViewWidth(50, true, false, 0)).toBe(50);
  });

  it("getMessageViewWidth subtracts sidebar when wide", () => {
    expect(getMessageViewWidth(100, false, false, 0)).toBe(65);
  });

  it("getMessageViewWidth subtracts media panel when open", () => {
    expect(getMessageViewWidth(100, false, true, 40)).toBe(25);
    expect(getMessageViewWidth(50, true, true, 20)).toBe(30);
  });
});
