import { describe, expect, it } from "vitest";
import { viewport } from "./layout";

describe("root viewport", () => {
  it("lets people zoom (WCAG 1.4.4)", () => {
    expect(viewport.maximumScale).toBeUndefined();
    expect(viewport.userScalable).not.toBe(false);
  });
});
