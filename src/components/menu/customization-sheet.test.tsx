import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomizationSheet } from "./customization-sheet";
import { getDrinkById } from "@/lib/domain/drink-rules";

const espresso = getDrinkById("espresso")!;
const latte = getDrinkById("latte")!;

describe("CustomizationSheet Component (Issue #3)", () => {
  it("does not render when isOpen is false", () => {
    const onClose = vi.fn();
    render(
      <CustomizationSheet
        isOpen={false}
        drink={espresso}
        onClose={onClose}
      />
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("displays Single or Double shot selection for Espresso instead of size", () => {
    const onClose = vi.fn();
    render(
      <CustomizationSheet
        isOpen={true}
        drink={espresso}
        onClose={onClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Customize Espresso/i })).toBeDefined();

    // Espresso must display shots
    expect(screen.getByText("Shots")).toBeDefined();
    expect(screen.getByRole("radio", { name: /Single Shot/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Double Shot/i })).toBeDefined();

    // Espresso must NOT display size options
    expect(screen.queryByText("Size")).toBeNull();
    expect(screen.queryByRole("radio", { name: /Small/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Medium/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Large/i })).toBeNull();

    // Default is Single Shot
    const singleRadio = screen.getByRole("radio", { name: /Single Shot/i });
    expect(singleRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("displays Small, Medium, Large sizes for drinks like Latte instead of shots", () => {
    const onClose = vi.fn();
    render(
      <CustomizationSheet
        isOpen={true}
        drink={latte}
        onClose={onClose}
      />
    );

    expect(screen.getByRole("heading", { name: /Customize Latte/i })).toBeDefined();

    // Latte must display size
    expect(screen.getByText("Size")).toBeDefined();
    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Large/i })).toBeDefined();

    // Latte must NOT display shots
    expect(screen.queryByText("Shots")).toBeNull();
    expect(screen.queryByRole("radio", { name: /Single Shot/i })).toBeNull();

    // Default is Medium
    const mediumRadio = screen.getByRole("radio", { name: /Medium/i });
    expect(mediumRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("updates the selected size or shot when clicked", () => {
    const onClose = vi.fn();
    render(
      <CustomizationSheet
        isOpen={true}
        drink={latte}
        onClose={onClose}
      />
    );

    const largeRadio = screen.getByRole("radio", { name: /Large/i });
    fireEvent.click(largeRadio);
    expect(largeRadio.getAttribute("aria-checked")).toBe("true");

    const mediumRadio = screen.getByRole("radio", { name: /Medium/i });
    expect(mediumRadio.getAttribute("aria-checked")).toBe("false");
  });

  it("calls onClose when the close button or backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <CustomizationSheet
        isOpen={true}
        drink={espresso}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole("button", { name: /Close customization/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId("customization-sheet-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
