import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderStatusPage from "./page";
import { getOrderTracking } from "@/lib/db/queries/tracking";
import { notFound } from "next/navigation";

vi.mock("@/lib/db/queries/tracking", () => ({
  getOrderTracking: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const id = "33333333-2222-4333-a444-555555555555";

function renderPage(orderId: string) {
  return OrderStatusPage({ params: Promise.resolve({ id: orderId }) });
}

describe("/order/[id] page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the order's live status", async () => {
    vi.mocked(getOrderTracking).mockResolvedValueOnce({
      id,
      guest_name: "Emma",
      status: "received",
      drink_name: "Flat White",
      options: { sizing: "Medium", milk: "Whole", temp: "Hot" },
      created_at: "2026-11-10T12:00:00.000Z",
      updated_at: "2026-11-10T12:00:00.000Z",
      orders_ahead: 1,
    });

    render(await renderPage(id));

    expect(
      screen.getByRole("heading", { level: 1, name: "Emma’s order" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent(
      "Received",
    );
    expect(screen.getByText("Flat White")).toBeInTheDocument();
    expect(screen.getByText("1 order ahead of you")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to menu/i })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("shows not found for an unknown order instead of placeholder data", async () => {
    vi.mocked(getOrderTracking).mockResolvedValueOnce(null);

    await expect(renderPage(id)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("shows not found for a malformed id without querying", async () => {
    await expect(renderPage("fallback-id-123")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(getOrderTracking).not.toHaveBeenCalled();
  });

  it("shows an error when the order cannot be loaded", async () => {
    vi.mocked(getOrderTracking).mockRejectedValueOnce(new Error("db down"));

    render(await renderPage(id));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn’t load your order/i,
    );
  });
});
