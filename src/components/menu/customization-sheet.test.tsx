import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomizationSheet } from "./customization-sheet";
import { getDrinkById } from "@/lib/domain/drink-rules";

describe("CustomizationSheet Component (Issue #3)", () => {
  const espresso = getDrinkById("espresso")!;
  const latte = getDrinkById("latte")!;
  const americano = getDrinkById("americano")!;

  it("does not render modal when isOpen is false", () => {
    render(
      <CustomizationSheet
        drink={espresso}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders shots selection for Espresso and omits size and milk options", () => {
    render(
      <CustomizationSheet
        drink={espresso}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Customize Espresso" })).toBeDefined();

    // Espresso displays Single or Double shot selection instead of size (#3)
    expect(screen.getByRole("radio", { name: /Single Shot/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Double Shot/i })).toBeDefined();

    // No size options for Espresso
    expect(screen.queryByRole("radio", { name: /Small/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Medium/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Large/i })).toBeNull();

    // No milk options for Espresso
    expect(screen.queryByText(/Milk/i)).toBeNull();
  });

  it("renders Small, Medium, Large sizes for Latte and omits shot options", () => {
    render(
      <CustomizationSheet
        drink={latte}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Latte displays sizes
    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Large/i })).toBeDefined();

    // No shot options for Latte
    expect(screen.queryByRole("radio", { name: /Single Shot/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Double Shot/i })).toBeNull();
  });

  it("renders size options for Americano and omits milk options", () => {
    render(
      <CustomizationSheet
        drink={americano}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("radio", { name: /Small/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Medium/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Large/i })).toBeDefined();
    expect(screen.queryByText(/Milk/i)).toBeNull();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <CustomizationSheet
        drink={espresso}
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("allows selecting a different shot option for Espresso", () => {
    render(
      <CustomizationSheet
        drink={espresso}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const singleShotRadio = screen.getByRole("radio", { name: /Single Shot/i });
    const doubleShotRadio = screen.getByRole("radio", { name: /Double Shot/i });

    expect(singleShotRadio.getAttribute("aria-checked")).toBe("true");
    expect(doubleShotRadio.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(doubleShotRadio);

    expect(doubleShotRadio.getAttribute("aria-checked")).toBe("true");
    expect(singleShotRadio.getAttribute("aria-checked")).toBe("false");
  });
});
