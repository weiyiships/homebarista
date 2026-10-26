import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DrinkCard } from "./drink-card";
import { STANDARD_DRINKS, type MenuItemDefinition } from "@/lib/domain/drink-rules";

describe("DrinkCard Component (Issue #3)", () => {
  const sampleDrink: MenuItemDefinition = STANDARD_DRINKS[0]; // Espresso

  it("renders drink name, description, and shot/size indicator", () => {
    render(<DrinkCard drink={sampleDrink} onSelect={vi.fn()} />);

    expect(screen.getByText("Espresso")).toBeDefined();
    expect(screen.getByText(sampleDrink.description)).toBeDefined();
    expect(screen.getByText(/Single \/ Double shot/i)).toBeDefined();
  });

  it("calls onSelect when an available drink card is clicked", () => {
    const handleSelect = vi.fn();
    render(<DrinkCard drink={sampleDrink} onSelect={handleSelect} />);

    const cardButton = screen.getByRole("button", { name: /Espresso/i });
    fireEvent.click(cardButton);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(sampleDrink);
  });

  it("renders an unavailable drink as disabled and does not trigger onSelect", () => {
    const handleSelect = vi.fn();
    const unavailableDrink: MenuItemDefinition = {
      ...sampleDrink,
      available: false,
    };

    render(<DrinkCard drink={unavailableDrink} onSelect={handleSelect} />);

    expect(screen.getByText(/Unavailable/i)).toBeDefined();

    const cardButton = screen.getByRole("button", { name: /Espresso/i });
    expect(cardButton.hasAttribute("disabled")).toBe(true);

    fireEvent.click(cardButton);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
