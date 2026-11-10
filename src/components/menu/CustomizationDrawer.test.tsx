import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CustomizationDrawer } from "./CustomizationDrawer";
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

describe("CustomizationDrawer", () => {
  it("does not render when isOpen is false", () => {
    render(
      <CustomizationDrawer
        drink={makeDrink()}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not render when drink is null", () => {
    render(
      <CustomizationDrawer drink={null} isOpen={true} onClose={vi.fn()} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders drink name in dialog header", () => {
    const drink = makeDrink({ name: "Cappuccino" });
    render(
      <CustomizationDrawer drink={drink} isOpen={true} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Customize Cappuccino" }),
    ).toBeInTheDocument();
  });

  it("renders temperature options (Hot and Iced)", () => {
    render(
      <CustomizationDrawer
        drink={makeDrink()}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Temperature" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Hot")).toBeInTheDocument();
    expect(screen.getByLabelText("Iced")).toBeInTheDocument();
  });

  describe("Espresso (shots, no milk)", () => {
    const espresso = makeDrink({
      name: "Espresso",
      takesMilk: false,
      sizeType: "shots",
    });

    it("renders shot count options", () => {
      render(
        <CustomizationDrawer
          drink={espresso}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByRole("group", { name: "Shots" })).toBeInTheDocument();
      expect(screen.getByLabelText("Single")).toBeInTheDocument();
      expect(screen.getByLabelText("Double")).toBeInTheDocument();
    });

    it("does not render milk options", () => {
      render(
        <CustomizationDrawer
          drink={espresso}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(
        screen.queryByRole("group", { name: "Milk Choice" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Latte (size, takes milk)", () => {
    const latte = makeDrink({
      name: "Latte",
      takesMilk: true,
      sizeType: "size",
    });

    it("renders size options", () => {
      render(
        <CustomizationDrawer drink={latte} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByRole("group", { name: "Size" })).toBeInTheDocument();
      expect(screen.getByLabelText("Small")).toBeInTheDocument();
      expect(screen.getByLabelText("Medium")).toBeInTheDocument();
      expect(screen.getByLabelText("Large")).toBeInTheDocument();
    });

    it("renders milk options", () => {
      render(
        <CustomizationDrawer drink={latte} isOpen={true} onClose={vi.fn()} />,
      );
      expect(
        screen.getByRole("group", { name: "Milk Choice" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Whole")).toBeInTheDocument();
      expect(screen.getByLabelText("Oat")).toBeInTheDocument();
      expect(screen.getByLabelText("Almond")).toBeInTheDocument();
      expect(screen.getByLabelText("Skim")).toBeInTheDocument();
    });
  });

  describe("Accessibility and interactions", () => {
    it("calls onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(
        <CustomizationDrawer
          drink={makeDrink()}
          isOpen={true}
          onClose={onClose}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(
        <CustomizationDrawer
          drink={makeDrink()}
          isOpen={true}
          onClose={onClose}
        />,
      );
      await userEvent.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Validation before Add to order", () => {
    it("displays validation errors and prevents submission when options are missing", async () => {
      const onAddToOrder = vi.fn();
      render(
        <CustomizationDrawer
          drink={makeDrink({ takesMilk: true, sizeType: "size" })}
          isOpen={true}
          onClose={vi.fn()}
          onAddToOrder={onAddToOrder}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: /add to order/i }),
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(/temperature selection is required/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/size selection is required/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/milk selection is required/i),
      ).toBeInTheDocument();
      expect(onAddToOrder).not.toHaveBeenCalled();
    });

    it("submits successfully when valid selections are made for a milk drink", async () => {
      const onAddToOrder = vi.fn();
      render(
        <CustomizationDrawer
          drink={makeDrink({ takesMilk: true, sizeType: "size" })}
          isOpen={true}
          onClose={vi.fn()}
          onAddToOrder={onAddToOrder}
        />,
      );

      await userEvent.click(screen.getByLabelText("Hot"));
      await userEvent.click(screen.getByLabelText("Medium"));
      await userEvent.click(screen.getByLabelText("Oat"));

      await userEvent.click(
        screen.getByRole("button", { name: /add to order/i }),
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onAddToOrder).toHaveBeenCalledWith({
        temp: "Hot",
        sizing: "Medium",
        milk: "Oat",
      });
    });

    it("submits successfully for non-milk drinks without milk option", async () => {
      const onAddToOrder = vi.fn();
      const espresso = makeDrink({
        name: "Espresso",
        takesMilk: false,
        sizeType: "shots",
      });

      render(
        <CustomizationDrawer
          drink={espresso}
          isOpen={true}
          onClose={vi.fn()}
          onAddToOrder={onAddToOrder}
        />,
      );

      await userEvent.click(screen.getByLabelText("Iced"));
      await userEvent.click(screen.getByLabelText("Double"));

      await userEvent.click(
        screen.getByRole("button", { name: /add to order/i }),
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onAddToOrder).toHaveBeenCalledWith({
        temp: "Iced",
        sizing: "Double",
      });
    });
  });
});
