import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomizationDrawer } from "./CustomizationDrawer";
import { type Drink } from "@/lib/domain/menu";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

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

  describe("Validation before Place Order", () => {
    it("displays validation errors and prevents submission when name and options are missing", async () => {
      render(
        <CustomizationDrawer
          drink={makeDrink({ takesMilk: true, sizeType: "size" })}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: /place order/i }),
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/your name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/temperature selection is required/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/size selection is required/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/milk selection is required/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("submits successfully to /api/orders and redirects to /order/[id]", async () => {
      const onClose = vi.fn();
      const mockOrderResponse = { id: "order-xyz-789" };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderResponse,
      } as Response);

      render(
        <CustomizationDrawer
          drink={makeDrink({
            id: "11111111-2222-3333-4444-555555555555",
            takesMilk: true,
            sizeType: "size",
          })}
          isOpen={true}
          onClose={onClose}
        />,
      );

      await userEvent.type(screen.getByLabelText(/your name/i), "Sarah");
      await userEvent.click(screen.getByLabelText("Hot"));
      await userEvent.click(screen.getByLabelText("Medium"));
      await userEvent.click(screen.getByLabelText("Oat"));

      await userEvent.click(
        screen.getByRole("button", { name: /place order/i }),
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "/api/orders",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              guest_name: "Sarah",
              drink_id: "11111111-2222-3333-4444-555555555555",
              options: {
                temp: "Hot",
                sizing: "Medium",
                milk: "Oat",
              },
            }),
          }),
        );
      });

      expect(onClose).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/order/order-xyz-789");
    });

    it("displays error toast when API call fails", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server busy, please retry" }),
      } as Response);

      render(
        <CustomizationDrawer
          drink={makeDrink({
            takesMilk: false,
            sizeType: "shots",
          })}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );

      await userEvent.type(screen.getByLabelText(/your name/i), "Dave");
      await userEvent.click(screen.getByLabelText("Iced"));
      await userEvent.click(screen.getByLabelText("Double"));

      await userEvent.click(
        screen.getByRole("button", { name: /place order/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/server busy, please retry/i),
        ).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();

      // Dismiss error toast
      await userEvent.click(
        screen.getByRole("button", { name: /dismiss error/i }),
      );
      expect(
        screen.queryByText(/server busy, please retry/i),
      ).not.toBeInTheDocument();
    });
  });
});
