import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DrinkCard } from "./drink-card";
import { STANDARD_DRINKS } from "@/lib/domain/drink-rules";

describe("DrinkCard Component", () => {
  const latte = STANDARD_DRINKS.find((d) => d.id === "latte")!;
  const espresso = STANDARD_DRINKS.find((d) => d.id === "espresso")!;

  it("renders drink details and size/shot category indicator", () => {
    const handleSelect = vi.fn();
    render(<DrinkCard drink={latte} onSelect={handleSelect} />);

    expect(screen.getByText("Latte")).toBeDefined();
    expect(screen.getByText(latte.description)).toBeDefined();
    expect(screen.getByText("Small / Medium / Large")).toBeDefined();
  });

  it("indicates Single / Double shot for espresso", () => {
    const handleSelect = vi.fn();
    render(<DrinkCard drink={espresso} onSelect={handleSelect} />);

    expect(screen.getByText("Espresso")).toBeDefined();
    expect(screen.getByText("Single / Double shot")).toBeDefined();
  });

  it("invokes onSelect when clicked while available", () => {
    const handleSelect = vi.fn();
    render(<DrinkCard drink={latte} onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Latte/i }));
    expect(handleSelect).toHaveBeenCalledWith(latte);
  });

  it("disables interaction when unavailable", () => {
    const handleSelect = vi.fn();
    const unavailableDrink = { ...latte, available: false };
    render(<DrinkCard drink={unavailableDrink} onSelect={handleSelect} />);

    const button = screen.getByRole("button");
    expect(button.getAttribute("disabled")).not.toBeNull();
    expect(screen.getByText("Unavailable")).toBeDefined();

    fireEvent.click(button);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
