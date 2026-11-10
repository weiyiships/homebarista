// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the monochrome theme (#40): neutral black-and-white tokens that keep
 * WCAG AA contrast in light and dark mode.
 */

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

function tokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [
      m[1],
      m[2].toLowerCase(),
    ]),
  );
}

const light = tokens(css.slice(0, css.indexOf("@media (prefers-color-scheme")));
const dark = tokens(css.slice(css.indexOf("@media (prefers-color-scheme")));

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isNeutral = (hex: string) =>
  hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme", (_, t) => {
  it("is monochrome: every non-status token is a neutral gray", () => {
    const base = Object.entries(t).filter(
      ([name]) => !name.startsWith("status"),
    );
    expect(base.length).toBeGreaterThanOrEqual(9);
    for (const [name, hex] of base) {
      expect(isNeutral(hex), `--${name} ${hex}`).toBe(true);
    }
  });

  it.each([
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["muted-foreground", "muted"],
    ["foreground", "muted"],
    ["primary-foreground", "primary"],
    ["primary", "background"],
  ])("--%s on --%s meets 4.5:1", (fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

describe("status badges", () => {
  it.each(["received", "brewing", "ready", "cancelled"])(
    "white text on --status-%s meets 4.5:1 in light mode",
    (status) => {
      expect(
        contrast("#ffffff", light[`status-${status}`]),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});
