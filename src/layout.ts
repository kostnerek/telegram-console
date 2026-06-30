export const NARROW_THRESHOLD = 60;
export const MIN_MESSAGE_WIDTH = 30;

export function isNarrowLayout(terminalWidth: number): boolean {
  return terminalWidth < NARROW_THRESHOLD;
}

export function getChatListWidth(terminalWidth: number): number {
  return Math.min(35, terminalWidth - MIN_MESSAGE_WIDTH);
}

export function getMessageViewWidth(
  terminalWidth: number,
  narrow: boolean,
  mediaPanelOpen: boolean,
  mediaPanelWidth: number,
): number {
  const base = narrow ? terminalWidth : terminalWidth - getChatListWidth(terminalWidth);
  return mediaPanelOpen ? base - mediaPanelWidth : base;
}
