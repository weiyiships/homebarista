import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomizationSheet } from "./customization-sheet";
import { STANDARD_DRINKS } from "@/lib/domain/drink-rules";

describe("CustomizationSheet Component", () => {
  const espresso = STANDARD_DRINKS.find((d) => d.id === "espresso")!;
  const latte = STANDARD_DRINKS.find((d) => d.id === "latte")!;
  const americano = STANDARD_DRINKS.find((d) => d.id === "americano")!;

  it("renders shot selection for espresso without milk options", () => {
    render(
      <CustomizationSheet
        drink={espresso}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /Customize Espresso/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Single Shot/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Double Shot/i })).toBeDefined();

    // No size or milk options
    expect(screen.queryByText(/Small/i)).toBeNull();
    expect(screen.queryByText(/Whole Milk/i)).toBeNull();
    expect(screen.queryByText(/Oat Milk/i)).toBeNull();
  });

  it("renders size and milk selection for latte with default medium and whole milk", () => {
    render(
      <CustomizationSheet
        drink={latte}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /Customize Latte/i })).toBeDefined();

    // Size options
    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    const mediumSize = screen.getByRole("radio", { name: /Medium/i });
    expect(mediumSize).toBeDefined();
    expect(mediumSize.getAttribute("aria-checked")).toBe("true");

    // Milk options
    const wholeMilk = screen.getByRole("radio", { name: /Whole Milk/i });
    expect(wholeMilk).toBeDefined();
    expect(wholeMilk.getAttribute("aria-checked")).toBe("true");

    expect(screen.getByRole("radio", { name: /Oat Milk/i })).toBeDefined();
  });

  it("omits milk option for Americano while showing sizes", () => {
    render(
      <CustomizationSheet
        drink={americano}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /Customize Americano/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.queryByText(/Milk/i)).toBeNull();
  });

  it("allows changing temperature to Iced", () => {
    const handleConfirm = vi.fn();
    render(
      <CustomizationSheet
        drink={latte}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    const icedButton = screen.getByRole("radio", { name: /Iced/i });
    fireEvent.click(icedButton);

    const submitBtn = screen.getByRole("button", { name: /Add to Order/i });
    fireEvent.click(submitBtn);

    expect(handleConfirm).toHaveBeenCalledWith(
      latte,
      expect.objectContaining({
        size: "medium",
        milk: "whole",
        temperature: "iced",
      })
    );
  });

  it("invokes onClose when cancel or close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <CustomizationSheet
        drink={latte}
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
