import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DrinkGrid } from "./DrinkGrid";
import { type Drink } from "@/lib/domain/menu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDrink(id: string, name: string, available = true): Drink {
  return {
    id,
    name,
    available,
    takesMilk: false,
    sizeType: "shots",
  };
}

const SAMPLE_DRINKS: Drink[] = [
  makeDrink("1", "Espresso"),
  makeDrink("2", "Americano"),
  makeDrink("3", "Latte", false),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DrinkGrid", () => {
  it("renders all drink cards", () => {
    render(<DrinkGrid drinks={SAMPLE_DRINKS} onSelect={vi.fn()} />);
    expect(screen.getByText("Espresso")).toBeInTheDocument();
    expect(screen.getByText("Americano")).toBeInTheDocument();
    expect(screen.getByText("Latte")).toBeInTheDocument();
  });

  it("renders an empty state message when drinks array is empty", () => {
    render(<DrinkGrid drinks={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/no drinks available/i)).toBeInTheDocument();
  });

  it("calls onSelect with the correct drink when a card is clicked", async () => {
    const onSelect = vi.fn();
    render(<DrinkGrid drinks={SAMPLE_DRINKS} onSelect={onSelect} />);
    await userEvent.click(
      screen.getByText("Espresso").closest("[role=button]")!,
    );
    expect(onSelect).toHaveBeenCalledWith(SAMPLE_DRINKS[0]);
  });

  it("renders a list landmark with an accessible label", () => {
    render(<DrinkGrid drinks={SAMPLE_DRINKS} onSelect={vi.fn()} />);
    expect(
      screen.getByRole("list", { name: /drink menu/i }),
    ).toBeInTheDocument();
  });

  it("renders each drink in a list item", () => {
    render(<DrinkGrid drinks={SAMPLE_DRINKS} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(SAMPLE_DRINKS.length);
  });
});
