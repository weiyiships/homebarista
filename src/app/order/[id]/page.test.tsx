import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderStatusPage from "./page";
import { getOrderById } from "@/lib/db/queries/orders";

vi.mock("@/lib/db/queries/orders", () => ({
  getOrderById: vi.fn(),
}));

describe("OrderStatusPage Component (Issue #5)", () => {
  it("renders order status, guest name, and drink name when order is found", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({
      id: "HB-9999",
      guestName: "Emma",
      customerId: null,
      status: "brewing",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item-1",
          orderId: "HB-9999",
          menuItemId: "drink-1",
          optionsJson: { temp: "Hot", sizing: "Medium" },
          drinkName: "Flat White",
        },
      ],
    });

    const jsx = await OrderStatusPage({
      params: Promise.resolve({ id: "HB-9999" }),
    });

    render(jsx);

    expect(screen.getByText("Emma’s Order")).toBeInTheDocument();
    expect(screen.getByText("HB-9999")).toBeInTheDocument();
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent(
      "brewing",
    );
    expect(screen.getByText("Flat White")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to menu/i })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("gracefully displays fallback order details when order is not found in DB", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce(null);

    const jsx = await OrderStatusPage({
      params: Promise.resolve({ id: "fallback-id-123" }),
    });

    render(jsx);

    expect(screen.getByText("fallback-id-123")).toBeInTheDocument();
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent(
      "received",
    );
    expect(screen.getByText("Custom Coffee")).toBeInTheDocument();
  });
});
