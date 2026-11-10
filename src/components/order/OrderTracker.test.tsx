import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { OrderTracker } from "./OrderTracker";
import type { OrderTracking } from "@/lib/schemas/order";

const id = "33333333-2222-4333-a444-555555555555";

function order(overrides: Partial<OrderTracking> = {}): OrderTracking {
  return {
    id,
    guest_name: "Cara",
    status: "received",
    drink_name: "Mocha",
    options: { sizing: "Small", milk: "Oat", temp: "Iced" },
    created_at: "2026-11-10T12:02:00.000Z",
    updated_at: "2026-11-10T12:02:00.000Z",
    orders_ahead: 2,
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OrderTracker", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    fetchMock.mockReset();
  });

  const tick = () => act(() => vi.advanceTimersByTimeAsync(2500));

  it("shows the guest, drink, options, and current status", () => {
    render(<OrderTracker initialOrder={order()} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Cara’s order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mocha")).toBeInTheDocument();
    expect(screen.getByText("Small · Oat milk · Iced")).toBeInTheDocument();
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent(
      "Received",
    );
  });

  it("shows queue position while received", () => {
    render(<OrderTracker initialOrder={order({ orders_ahead: 2 })} />);
    expect(screen.getByText("2 orders ahead of you")).toBeInTheDocument();
  });

  it("says you're next when nothing is ahead", () => {
    render(<OrderTracker initialOrder={order({ orders_ahead: 0 })} />);
    expect(screen.getByText("You're next")).toBeInTheDocument();
  });

  it("marks progress on the stepper", () => {
    render(<OrderTracker initialOrder={order({ status: "brewing" })} />);

    const steps = within(
      screen.getByRole("list", { name: "Order progress" }),
    ).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent)).toEqual([
      "Received",
      "Brewing",
      "Ready",
      "Picked up",
    ]);
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    expect(screen.queryByText(/ahead of you/)).not.toBeInTheDocument();
  });

  it("shows a prominent banner when the drink is ready", () => {
    render(<OrderTracker initialOrder={order({ status: "ready" })} />);

    expect(
      screen.getByRole("heading", { name: "Your drink is ready!" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pick it up/i)).toBeInTheDocument();
  });

  it("shows a cancelled state without the stepper", () => {
    render(<OrderTracker initialOrder={order({ status: "cancelled" })} />);

    expect(
      screen.getByRole("heading", { name: "This order was cancelled" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Order progress" }),
    ).not.toBeInTheDocument();
  });

  it("polls every 2.5 seconds and updates without a refresh", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(order({ orders_ahead: 1 })));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(order({ status: "ready", orders_ahead: null })),
    );
    render(<OrderTracker initialOrder={order()} />);
    expect(fetchMock).not.toHaveBeenCalled();

    await tick();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/orders/${id}`,
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(screen.getByText("1 order ahead of you")).toBeInTheDocument();

    await tick();
    expect(
      screen.getByRole("heading", { name: "Your drink is ready!" }),
    ).toBeInTheDocument();
  });

  it("announces status changes to screen readers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(order({ status: "brewing", orders_ahead: null })),
    );
    render(<OrderTracker initialOrder={order()} />);

    await tick();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Your order is brewing.",
    );
  });

  it("stops polling once the order is finished", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(order({ status: "picked_up", orders_ahead: null })),
    );
    render(<OrderTracker initialOrder={order({ status: "ready" })} />);

    await tick();
    await tick();
    await tick();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent(
      "Picked up",
    );
  });

  it("does not poll an order that is already cancelled", async () => {
    render(<OrderTracker initialOrder={order({ status: "cancelled" })} />);

    await tick();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the last status and warns while offline", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    fetchMock.mockResolvedValueOnce(jsonResponse(order({ orders_ahead: 1 })));
    render(<OrderTracker initialOrder={order()} />);

    await tick();
    expect(screen.getByText("2 orders ahead of you")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/reconnecting/i);

    await tick();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("1 order ahead of you")).toBeInTheDocument();
  });

  it("treats an unexpected response as a connection problem", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "nope" }, 500));
    render(<OrderTracker initialOrder={order()} />);

    await tick();

    expect(screen.getByRole("alert")).toHaveTextContent(/reconnecting/i);
  });

  it("stops polling after unmount", async () => {
    const { unmount } = render(<OrderTracker initialOrder={order()} />);
    unmount();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
