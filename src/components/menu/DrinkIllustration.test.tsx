import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DrinkIllustration } from "./DrinkIllustration";

const DRINKS = [
  "Espresso",
  "Americano",
  "Latte",
  "Cappuccino",
  "Flat White",
  "Mocha",
];

describe("DrinkIllustration", () => {
  it.each(DRINKS)("draws an original, decorative SVG for %s", (name) => {
    const { container } = render(<DrinkIllustration name={name} />);
    const svg = container.querySelector("svg");

    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-drink", name);
    expect(container.querySelector("image, img")).toBeNull();
  });

  it("gives every drink a different drawing", () => {
    const drawings = DRINKS.map(
      (name) =>
        render(<DrinkIllustration name={name} />).container.querySelector("svg")
          ?.innerHTML,
    );
    expect(new Set(drawings).size).toBe(DRINKS.length);
  });

  it("falls back to a generic cup for unknown drinks", () => {
    const { container } = render(<DrinkIllustration name="Cortado" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-drink",
      "generic",
    );
  });
});
