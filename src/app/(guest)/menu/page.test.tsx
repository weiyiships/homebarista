import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MenuPage from "./page";

describe("Menu Catalog Page", () => {
  it("renders the menu catalog title and all standard drinks", () => {
    render(<MenuPage />);

    expect(screen.getByRole("heading", { name: "Coffee Menu" })).toBeDefined();

    expect(screen.getByText("Espresso")).toBeDefined();
    expect(screen.getByText("Americano")).toBeDefined();
    expect(screen.getByText("Latte")).toBeDefined();
    expect(screen.getByText("Cappuccino")).toBeDefined();
    expect(screen.getByText("Flat White")).toBeDefined();
    expect(screen.getByText("Mocha")).toBeDefined();
  });

  it("opens customization sheet when a drink is selected", () => {
    render(<MenuPage />);

    // Customization sheet should not be visible initially
    expect(screen.queryByRole("dialog")).toBeNull();

    // Click on Latte card
    const latteCard = screen.getByRole("button", { name: /Latte/i });
    fireEvent.click(latteCard);

    // Modal dialog opens
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Customize Latte/i })).toBeDefined();
  });

  it("closes customization sheet when cancelled", () => {
    render(<MenuPage />);

    // Open sheet
    fireEvent.click(screen.getByRole("button", { name: /Latte/i }));
    expect(screen.getByRole("dialog")).toBeDefined();

    // Click cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
