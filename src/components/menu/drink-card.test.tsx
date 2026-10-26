import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DrinkCard } from "./drink-card";
import type { Drink } from "@/lib/domain/drink-rules";

const testDrink: Drink = {
  id: "latte",
  name: "Latte",
  description: "Espresso with steamed milk and a thin layer of microfoam",
  sizeType: "size",
  takesMilk: true,
  available: true,
};

describe("DrinkCard Component (Issue #3)", () => {
  it("renders drink name and description", () => {
    const onSelect = vi.fn();
    render(<DrinkCard drink={testDrink} onSelect={onSelect} />);

    expect(screen.getByRole("heading", { name: "Latte" })).toBeDefined();
    expect(
      screen.getByText("Espresso with steamed milk and a thin layer of microfoam")
    ).toBeDefined();
  });

  it("calls onSelect when an available drink is clicked", () => {
    const onSelect = vi.fn();
    render(<DrinkCard drink={testDrink} onSelect={onSelect} />);

    const cardButton = screen.getByRole("button", { name: /Latte/i });
    fireEvent.click(cardButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(testDrink);
  });

  it("visually disables card and does not trigger onSelect when drink is unavailable", () => {
    const onSelect = vi.fn();
    const unavailableDrink: Drink = { ...testDrink, available: false };
    render(<DrinkCard drink={unavailableDrink} onSelect={onSelect} />);

    const cardButton = screen.getByRole("button", { name: /Latte/i });
    expect(cardButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/Unavailable/i)).toBeDefined();

    fireEvent.click(cardButton);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
