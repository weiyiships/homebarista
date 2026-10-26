import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MenuPage from "./page";

describe("Menu Page (Issue #3)", () => {
  it("renders page title and all 6 standard drinks", () => {
    render(<MenuPage />);

    expect(screen.getByRole("heading", { name: "Menu" })).toBeDefined();

    const expectedDrinks = [
      "Espresso",
      "Americano",
      "Latte",
      "Cappuccino",
      "Flat White",
      "Mocha",
    ];

    for (const name of expectedDrinks) {
      expect(screen.getByRole("heading", { name })).toBeDefined();
    }
  });

  it("opens customization sheet with Single/Double shots when Espresso is selected", () => {
    render(<MenuPage />);

    expect(screen.queryByRole("dialog")).toBeNull();

    const espressoCard = screen.getByRole("button", { name: /Espresso/i });
    fireEvent.click(espressoCard);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Customize Espresso/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Single Shot/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Double Shot/i })).toBeDefined();
    expect(screen.queryByRole("radio", { name: /Medium/i })).toBeNull();
  });

  it("opens customization sheet with Small/Medium/Large size when Latte is selected", () => {
    render(<MenuPage />);

    const latteCard = screen.getByRole("button", { name: /Latte/i });
    fireEvent.click(latteCard);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Customize Latte/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Large/i })).toBeDefined();
    expect(screen.queryByRole("radio", { name: /Single Shot/i })).toBeNull();
  });

  it("closes customization sheet when close button is clicked", () => {
    render(<MenuPage />);

    fireEvent.click(screen.getByRole("button", { name: /Americano/i }));
    expect(screen.getByRole("dialog")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /Close customization/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
