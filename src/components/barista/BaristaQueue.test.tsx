import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaristaQueue, type QueueOrder } from "./BaristaQueue";

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

const orders: QueueOrder[] = [
  {
    id: "11111111-2222-4333-a444-555555555555",
    guestName: "Alice",
    drinkName: "Latte",
    status: "ready",
    createdAt: "2026-11-10T12:00:00.000Z",
    options: { sizing: "Large", milk: "Oat", temp: "Iced" },
  },
  {
    id: "22222222-2222-4333-a444-555555555555",
    guestName: "Bob",
    drinkName: "Espresso",
    status: "received",
    createdAt: "2026-11-10T12:01:00.000Z",
    options: { sizing: "Double", milk: null, temp: "Hot" },
  },
  {
    id: "33333333-2222-4333-a444-555555555555",
    guestName: "Cara",
    drinkName: "Mocha",
    status: "cancelled",
    createdAt: "2026-11-10T11:59:00.000Z",
    options: { sizing: "Small", milk: "Whole", temp: "Hot" },
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
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
    vi.useRealTimers();
    fetchMock.mockReset();
    routerReplace.mockReset();
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
  it("lists orders oldest-first regardless of input order", () => {
    const shuffled = [orders[1], orders[0]];
    render(<BaristaQueue initialOrders={shuffled} />);

    const names = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);
    expect(names).toEqual(["Alice", "Bob"]);
  });

  it("shows drink, size or shots, milk, temperature, and time waiting", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T12:03:05.000Z"));
    render(<BaristaQueue initialOrders={orders} />);

    const aliceCard = screen.getByRole("article", { name: /alice/i });
    expect(within(aliceCard).getByText("Latte")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Large")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Oat milk")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Iced")).toBeInTheDocument();
    expect(within(aliceCard).getByText("3m 05s")).toBeInTheDocument();

    const bobCard = screen.getByRole("article", { name: /bob/i });
    expect(within(bobCard).getByText("Double")).toBeInTheDocument();
    expect(within(bobCard).getByText("Hot")).toBeInTheDocument();
    expect(within(bobCard).queryByText(/milk/i)).not.toBeInTheDocument();
  });

  describe("live updates", () => {
    const newOrder = {
      id: "44444444-2222-4333-a444-555555555555",
      guest_name: "Dee",
      drink_name: "Flat White",
      status: "received",
      created_at: "2026-11-10T12:02:00.000Z",
      options: { sizing: "Medium", milk: "Almond", temp: "Hot" },
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-11-10T12:03:00.000Z"));
    });

    it("polls the queue every 2.5 seconds and shows new orders", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          orders: [
            {
              id: orders[1].id,
              guest_name: "Bob",
              drink_name: "Espresso",
              status: "received",
              created_at: orders[1].createdAt,
              options: orders[1].options,
            },
            newOrder,
          ],
        }),
      );
      render(<BaristaQueue initialOrders={[orders[1]]} />);
      expect(fetchMock).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/barista/queue",
        expect.objectContaining({ cache: "no-store" }),
      );
      expect(screen.getByText("Dee")).toBeInTheDocument();
      expect(screen.getByText("Almond milk")).toBeInTheDocument();
    });

    it("updates elapsed time every second", async () => {
      render(<BaristaQueue initialOrders={[orders[1]]} />);
      const bobCard = screen.getByRole("article", { name: /bob/i });
      expect(within(bobCard).getByText("2m 00s")).toBeInTheDocument();

      fetchMock.mockResolvedValue(
        jsonResponse({ orders: [] }),
      );
      await act(() => vi.advanceTimersByTimeAsync(1000));

      expect(within(bobCard).getByText("2m 01s")).toBeInTheDocument();
    });

    it("keeps the last queue and warns when a poll fails", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("offline"));
      render(<BaristaQueue initialOrders={[orders[1]]} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(
        /reconnecting/i,
      );

      fetchMock.mockResolvedValueOnce(jsonResponse({ orders: [newOrder] }));
      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(screen.getByRole("status")).not.toHaveTextContent(
        /reconnecting/i,
      );
      expect(screen.getByText("Dee")).toBeInTheDocument();
    });

    it("warns instead of crashing on an unexpected response", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ nope: true }));
      render(<BaristaQueue initialOrders={[orders[1]]} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
    });

    it("sends the barista to the passcode page when the session expires", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ error: "Unauthorized" }, 401),
      );
      render(<BaristaQueue initialOrders={[orders[1]]} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(routerReplace).toHaveBeenCalledWith(
        "/barista/login?next=%2Fbarista",
      );
    });

    it("stops polling after unmount", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ orders: [] }));
      const { unmount } = render(<BaristaQueue initialOrders={[]} />);
      unmount();

      await vi.advanceTimersByTimeAsync(10_000);

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
