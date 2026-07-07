import { Jimp } from "jimp";
import { createSupportsTerminalGraphics } from "supports-terminal-graphics";
import { DIACRITICS } from "./kittyDiacritics.js";

// Kitty graphics protocol — Unicode placeholder rendering.
//
// Why placeholders (not direct placement): the image is emitted as ordinary
// *text* (a grid of U+10EEEE placeholder chars colored with the image id), so it
// lives inside Ink's <Text> and survives Ink's frame redraws without re-blitting
// or absolute cursor positioning. Ghostty and iTerm 3.6+ support this; other
// terminals fall back to ANSI half-blocks (see imageRenderer.ts).

const ESC = "\x1b";
const PLACEHOLDER = "\u{10EEEE}";

// One image id is enough: only one media panel is open at a time, and re-sending
// under the same id replaces the previous image.
const IMAGE_ID = 1;

export function supportsKittyGraphics(): boolean {
  try {
    return !!createSupportsTerminalGraphics(process.stdout).kitty;
  } catch {
    return false;
  }
}

export interface KittyImage {
  /** Escape string to write directly to stdout: uploads the image + creates the virtual placement. */
  control: string;
  /** Placeholder-character grid to render as Ink <Text>; the terminal paints the image over it. */
  grid: string;
  cols: number;
  rows: number;
}

// Convert an arbitrary media buffer (jpg/png/…) to PNG, downscale for transmission
// speed, and compute the placeholder grid sized to fit contentWidth x maxRows cells.
export async function buildKittyImage(
  buffer: Buffer,
  contentWidth: number,
  maxRows: number,
): Promise<KittyImage> {
  const img = await Jimp.fromBuffer(buffer);
  if (img.bitmap.width > 1024) img.resize({ w: 1024 });
  const png = (await img.getBuffer("image/png")) as Buffer;

  const cols = Math.max(1, Math.min(contentWidth, DIACRITICS.length));
  // Terminal cells are ~1:2 (w:h), so halve to preserve the image's aspect ratio.
  const aspectRows = Math.round(cols * (img.bitmap.height / img.bitmap.width) * 0.5);
  const rows = Math.max(1, Math.min(aspectRows, maxRows, DIACRITICS.length));

  return { control: transmitAndPlace(png, cols, rows), grid: placeholderGrid(cols, rows), cols, rows };
}

// Delete the transmitted image (call on panel close to avoid ghosting).
export function clearKittyImage(): string {
  return `${ESC}_Ga=d,d=i,i=${IMAGE_ID},q=2${ESC}\\`;
}

// Two-step per spec: (1) transmit data only (a=t, no placement), then
// (2) create a virtual placement (a=p, U=1) sized cols x rows.
function transmitAndPlace(png: Buffer, cols: number, rows: number): string {
  const b64 = png.toString("base64");
  const chunkSize = 4096;
  const total = Math.max(1, Math.ceil(b64.length / chunkSize));
  let out = "";
  for (let i = 0; i < total; i++) {
    const chunk = b64.slice(i * chunkSize, (i + 1) * chunkSize);
    const more = i === total - 1 ? 0 : 1;
    out += i === 0
      ? `${ESC}_Gi=${IMAGE_ID},a=t,f=100,t=d,q=2,m=${more};${chunk}${ESC}\\`
      : `${ESC}_Gm=${more};${chunk}${ESC}\\`;
  }
  out += `${ESC}_Ga=p,U=1,i=${IMAGE_ID},c=${cols},r=${rows},q=2${ESC}\\`;
  return out;
}

// Grid of placeholder cells. Image id carried in the foreground color (256-indexed
// for id <= 255). Each cell = PLACEHOLDER + rowDiacritic + colDiacritic.
function placeholderGrid(cols: number, rows: number): string {
  const setColor = IMAGE_ID <= 255
    ? `${ESC}[38;5;${IMAGE_ID}m`
    : `${ESC}[38;2;${(IMAGE_ID >> 16) & 0xff};${(IMAGE_ID >> 8) & 0xff};${IMAGE_ID & 0xff}m`;
  const reset = `${ESC}[39m`;
  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    const rowDia = String.fromCodePoint(DIACRITICS[row]!);
    let line = setColor;
    for (let col = 0; col < cols; col++) {
      line += PLACEHOLDER + rowDia + String.fromCodePoint(DIACRITICS[col]!);
    }
    lines.push(line + reset);
  }
  return lines.join("\n");
}
