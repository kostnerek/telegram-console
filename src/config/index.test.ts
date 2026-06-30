import { describe, it, expect, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { loadConfig, loadConfigWithEnvOverrides } from "./index";

function tmpConfigDir(noColor?: boolean): string {
  const dir = mkdtempSync(join(tmpdir(), "tgc-cfg-"));
  mkdirSync(dir, { recursive: true });
  const cfg: Record<string, unknown> = {
    apiId: 1, apiHash: "h", sessionPersistence: "persistent",
    logLevel: "info", authMethod: "qr", messageLayout: "classic", uiMode: "full",
  };
  if (noColor !== undefined) cfg.noColor = noColor;
  writeFileSync(join(dir, "config.json"), JSON.stringify(cfg));
  return dir;
}

describe("config noColor", () => {
  const prev = process.env.NO_COLOR;
  afterEach(() => {
    if (prev === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prev;
  });

  it("defaults noColor to false when absent", () => {
    const dir = tmpConfigDir();
    expect(loadConfig(dir)!.noColor).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it("preserves a persisted noColor=true", () => {
    const dir = tmpConfigDir(true);
    delete process.env.NO_COLOR;
    expect(loadConfigWithEnvOverrides(dir)!.noColor).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it("forces noColor=true when NO_COLOR env is set non-empty", () => {
    const dir = tmpConfigDir(false);
    process.env.NO_COLOR = "1";
    expect(loadConfigWithEnvOverrides(dir)!.noColor).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});
