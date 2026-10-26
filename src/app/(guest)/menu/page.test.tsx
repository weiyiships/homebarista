import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MenuPage from "./page";

describe("MenuPage (Issue #3)", () => {
  it("displays the menu header and all 6 standard drinks", () => {
    render(<MenuPage />);

    expect(screen.getByRole("heading", { name: /Coffee Menu/i })).toBeDefined();

    const standardDrinks = [
      "Espresso",
      "Americano",
      "Latte",
      "Cappuccino",
      "Flat White",
      "Mocha",
    ];

    for (const name of standardDrinks) {
      expect(screen.getByRole("heading", { name })).toBeDefined();
    }
  });

  it("opens customization drawer with shots selection when Espresso is clicked", () => {
    render(<MenuPage />);

    const espressoButton = screen.getByRole("button", { name: /Espresso/i });
    fireEvent.click(espressoButton);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Customize Espresso" })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Single Shot/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Double Shot/i })).toBeDefined();
    expect(screen.queryByRole("radio", { name: /Small/i })).toBeNull();
  });

  it("opens customization drawer with sizes selection when Latte is clicked", () => {
    render(<MenuPage />);

    const latteButton = screen.getByRole("button", { name: /Latte/i });
    fireEvent.click(latteButton);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Customize Latte" })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Large/i })).toBeDefined();
    expect(screen.queryByRole("radio", { name: /Single Shot/i })).toBeNull();
  });

  it("closes customization drawer when close button is clicked", () => {
    render(<MenuPage />);

    const americanoButton = screen.getByRole("button", { name: /Americano/i });
    fireEvent.click(americanoButton);

    expect(screen.getByRole("dialog")).toBeDefined();

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
