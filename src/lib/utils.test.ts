import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn helper utility (AGENTS.md Section 1.3)", () => {
  it("merges standard class names correctly", () => {
    const result = cn("text-base", "font-medium");
    expect(result).toBe("text-base font-medium");
  });

  it("handles conditional class names", () => {
    const isHidden = false;
    const isActive = true;
    const result = cn("base-class", isHidden && "hidden", isActive && "active");
    expect(result).toBe("base-class active");
  });

  it("resolves conflicting tailwind classes using tailwind-merge", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });
});
