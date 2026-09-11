import { describe, it, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Progressive Web App (PWA) Assets & Manifest", () => {
  it("verifies web app manifest validity and required PWA fields", () => {
    const manifestPath = join(process.cwd(), "public", "manifest.webmanifest");
    expect(existsSync(manifestPath)).toBe(true);

    const content = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(content.name).toBe("RUXS — Everyday Life, on Autopilot");
    expect(content.short_name).toBe("RUXS");
    expect(content.display).toBe("standalone");
    expect(content.start_url).toBe("/");
    expect(content.theme_color).toBe("#090d16");
    expect(content.background_color).toBe("#090d16");
    expect(content.icons.length).toBeGreaterThanOrEqual(1);
  });

  it("verifies service worker script exists and enforces edge security invariants", () => {
    const swPath = join(process.cwd(), "public", "sw.js");
    expect(existsSync(swPath)).toBe(true);

    const swContent = readFileSync(swPath, "utf-8");
    // Must never cache dynamic /api/ financial routes
    expect(swContent).toContain('url.pathname.startsWith("/api/")');
    // Must have offline fallback
    expect(swContent).toContain("/offline");
    expect(swContent).toContain("ruxs-app-v1");
  });
});
