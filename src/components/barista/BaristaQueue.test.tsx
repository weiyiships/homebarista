import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaristaQueue, type QueueOrder } from "./BaristaQueue";

const orders: QueueOrder[] = [
  {
    id: "11111111-2222-4333-a444-555555555555",
    guestName: "Alice",
    drinkName: "Latte",
    status: "ready",
  },
  {
    id: "22222222-2222-4333-a444-555555555555",
    guestName: "Bob",
    drinkName: "Espresso",
    status: "received",
  },
  {
    id: "33333333-2222-4333-a444-555555555555",
    guestName: "Cara",
    drinkName: "Mocha",
    status: "cancelled",
  },
];

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("BaristaQueue", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("only shows active orders", () => {
    render(<BaristaQueue initialOrders={orders} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Cara")).not.toBeInTheDocument();
  });

  it("updates the badge when an order advances", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: orders[1].id, status: "brewing" }),
    );
    render(<BaristaQueue initialOrders={orders} />);

    const bobCard = screen.getByRole("article", { name: /bob/i });
    await user.click(
      within(bobCard).getByRole("button", { name: "Start brewing" }),
    );

    await waitFor(() =>
      expect(
        within(bobCard).getByTestId("queue-status-badge"),
      ).toHaveTextContent("Brewing"),
    );
    expect(
      within(bobCard).getByRole("button", { name: "Mark ready" }),
    ).toBeInTheDocument();
  });

  it("removes an order from the queue once it is picked up", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: orders[0].id, status: "picked_up" }),
    );
    render(<BaristaQueue initialOrders={orders} />);

    const aliceCard = screen.getByRole("article", { name: /alice/i });
    await user.click(
      within(aliceCard).getByRole("button", { name: "Mark picked up" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Alice")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("removes an order from the queue once it is cancelled", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: orders[1].id, status: "cancelled" }),
    );
    render(<BaristaQueue initialOrders={orders} />);

    const bobCard = screen.getByRole("article", { name: /bob/i });
    await user.click(within(bobCard).getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    await waitFor(() =>
      expect(screen.queryByText("Bob")).not.toBeInTheDocument(),
    );
  });

  it("shows an empty state when there are no active orders", () => {
    render(<BaristaQueue initialOrders={[orders[2]]} />);
    expect(screen.getByText(/no active orders/i)).toBeInTheDocument();
  });
});
