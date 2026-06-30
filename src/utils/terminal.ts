/**
 * Clears the terminal screen, scrollback, and moves the cursor home.
 * Accepts a writer for testability; defaults to stdout.
 */
export function clearTerminal(
  write: (s: string) => void = (s) => { process.stdout.write(s); },
): void {
  write("\x1b[2J\x1b[3J\x1b[H");
}
