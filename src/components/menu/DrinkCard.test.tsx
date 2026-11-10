import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DrinkCard } from "./DrinkCard";
import { type Drink } from "@/lib/domain/menu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDrink(overrides: Partial<Drink> = {}): Drink {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Latte",
    available: true,
    takesMilk: true,
    sizeType: "size",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DrinkCard", () => {
  it("renders the drink name", () => {
    render(
      <DrinkCard drink={makeDrink({ name: "Espresso" })} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("Espresso")).toBeInTheDocument();
  });

  it("renders a description for the drink", () => {
    render(
      <DrinkCard drink={makeDrink({ name: "Latte" })} onSelect={vi.fn()} />,
    );
    expect(
      screen.getByText(/smooth espresso with steamed milk/i),
    ).toBeInTheDocument();
  });

  it("renders a fallback description for unknown drinks", () => {
    render(
      <DrinkCard
        drink={makeDrink({ name: "Mystery Brew" })}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/handcrafted coffee/i)).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    const drink = makeDrink({ name: "Cappuccino" });
    render(<DrinkCard drink={drink} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(drink);
  });

  it("calls onSelect when Enter is pressed", async () => {
    const onSelect = vi.fn();
    const drink = makeDrink({ name: "Cappuccino" });
    render(<DrinkCard drink={drink} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(drink);
  });

  it("calls onSelect when Space is pressed", async () => {
    const onSelect = vi.fn();
    const drink = makeDrink({ name: "Mocha" });
    render(<DrinkCard drink={drink} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    btn.focus();
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith(drink);
  });

  describe("unavailable drink", () => {
    it("shows Unavailable label", () => {
      render(
        <DrinkCard
          drink={makeDrink({ available: false })}
          onSelect={vi.fn()}
        />,
      );
      expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    });

    it("does not call onSelect when clicked", async () => {
      const onSelect = vi.fn();
      render(
        <DrinkCard
          drink={makeDrink({ available: false })}
          onSelect={onSelect}
        />,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("sets aria-disabled to true", () => {
      render(
        <DrinkCard
          drink={makeDrink({ available: false })}
          onSelect={vi.fn()}
        />,
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });
  });

  it("names the card by its visible text (WCAG 2.5.3)", () => {
    render(
      <DrinkCard
        drink={makeDrink({ name: "Latte", available: false })}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Latte Smooth espresso with steamed milk. Unavailable",
    );
  });

  it("lays out text on the left and the drink illustration on the right", () => {
    const { container } = render(
      <DrinkCard drink={makeDrink({ name: "Mocha" })} onSelect={vi.fn()} />,
    );
    const card = screen.getByRole("button");
    const heading = screen.getByRole("heading", { name: "Mocha" });
    const art = container.querySelector('svg[data-drink="Mocha"]');

    expect(art).not.toBeNull();
    expect(card).toContainElement(art as HTMLElement);
    // Text column comes first in reading order, artwork after it.
    expect(
      heading.compareDocumentPosition(art as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
