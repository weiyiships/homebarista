import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DrinkCard } from "./drink-card";
import { STANDARD_DRINKS, type MenuItemDefinition } from "@/lib/domain/drink-rules";

describe("DrinkCard Component (Issue #3)", () => {
  const sampleDrink: MenuItemDefinition = STANDARD_DRINKS[0]; // Espresso

  it("renders drink name, description, and shot/size indicator", () => {
    render(<DrinkCard drink={sampleDrink} onSelect={vi.fn()} />);

    expect(screen.getByText("Espresso")).toBeInTheDocument();
    expect(screen.getByText(sampleDrink.description)).toBeInTheDocument();
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

    expect(screen.getByText(/Unavailable/i)).toBeInTheDocument();

    const cardButton = screen.getByRole("button", { name: /Espresso/i });
    expect(cardButton).toBeDisabled();

    fireEvent.click(cardButton);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
