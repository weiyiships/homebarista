import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { formatClockTime } from "@/lib/domain/history";
import { BaristaHistory, type HistoryOrder } from "./BaristaHistory";

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

const orders: HistoryOrder[] = [
  {
    id: "1a2b3c4d-2222-4333-a444-555555555555",
    guestName: "Alice",
    drinkName: "Latte",
    status: "picked_up",
    createdAt: "2026-11-10T12:00:00.000Z",
    finishedAt: "2026-11-10T12:06:00.000Z",
    options: { sizing: "Large", milk: "Oat", temp: "Iced" },
  },
  {
    id: "9f8e7d6c-2222-4333-a444-555555555555",
    guestName: "Bob",
    drinkName: "Espresso",
    status: "cancelled",
    createdAt: "2026-11-10T12:02:00.000Z",
    finishedAt: "2026-11-10T12:08:00.000Z",
    options: { sizing: "Double", milk: null, temp: "Hot" },
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function names() {
  return screen
    .getAllByRole("article")
    .map((card) => within(card).getByRole("heading").textContent);
}

describe("BaristaHistory", () => {
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

  it("lists finished orders newest first", () => {
    render(<BaristaHistory initialOrders={orders} />);

    expect(names()).toEqual(["Bob", "Alice"]);
  });

  it("shows total, picked-up, and cancelled counts", () => {
    render(<BaristaHistory initialOrders={orders} />);

    const summary = screen.getByRole("list", { name: "History summary" });
    expect(within(summary).getByText("Total").nextSibling).toHaveTextContent(
      "2",
    );
    expect(
      within(summary).getByText("Picked up").nextSibling,
    ).toHaveTextContent("1");
    expect(
      within(summary).getByText("Cancelled").nextSibling,
    ).toHaveTextContent("1");
  });

  it("shows order ID, guest, final status, drink, options, and times", () => {
    render(<BaristaHistory initialOrders={orders} />);

    const aliceCard = screen.getByRole("article", { name: /alice/i });
    expect(within(aliceCard).getByText("#1A2B3C")).toBeInTheDocument();
    expect(
      within(aliceCard).getByTestId("history-status-badge"),
    ).toHaveTextContent("Picked up");
    expect(within(aliceCard).getByText("Latte")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Large")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Oat milk")).toBeInTheDocument();
    expect(within(aliceCard).getByText("Iced")).toBeInTheDocument();

    const ordered = within(aliceCard).getByText(
      formatClockTime("2026-11-10T12:00:00.000Z"),
    );
    expect(ordered).toHaveAttribute("dateTime", "2026-11-10T12:00:00.000Z");
    expect(ordered.parentElement).toHaveTextContent(/ordered/i);
    const finished = within(aliceCard).getByText(
      formatClockTime("2026-11-10T12:06:00.000Z"),
    );
    expect(finished).toHaveAttribute("dateTime", "2026-11-10T12:06:00.000Z");
    expect(finished.parentElement).toHaveTextContent(/picked up/i);

    const bobCard = screen.getByRole("article", { name: /bob/i });
    expect(
      within(bobCard).getByTestId("history-status-badge"),
    ).toHaveTextContent("Cancelled");
    expect(within(bobCard).queryByText(/milk/i)).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing has finished yet", () => {
    render(<BaristaHistory initialOrders={[]} />);

    expect(screen.getByText(/no finished orders yet/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("starts in the reconnecting state when the first load failed", () => {
    render(<BaristaHistory initialOrders={[]} initiallyOffline />);

    expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
  });

  describe("live updates", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("polls every 2.5 seconds and shows newly finished orders", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          orders: [
            {
              id: "44444444-2222-4333-a444-555555555555",
              guest_name: "Dee",
              drink_name: "Flat White",
              status: "picked_up",
              created_at: "2026-11-10T12:05:00.000Z",
              finished_at: "2026-11-10T12:10:00.000Z",
              options: { sizing: "Medium", milk: "Almond", temp: "Hot" },
            },
            {
              id: orders[1].id,
              guest_name: "Bob",
              drink_name: "Espresso",
              status: "cancelled",
              created_at: orders[1].createdAt,
              finished_at: orders[1].finishedAt,
              options: orders[1].options,
            },
          ],
        }),
      );
      render(<BaristaHistory initialOrders={[orders[1]]} />);
      expect(fetchMock).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/barista/history",
        expect.objectContaining({ cache: "no-store" }),
      );
      expect(names()).toEqual(["Dee", "Bob"]);
      expect(screen.getByText("Almond milk")).toBeInTheDocument();
    });

    it("shows a reconnecting notice when a poll fails, and recovers", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));
      fetchMock.mockResolvedValueOnce(jsonResponse({ orders: [] }));
      render(<BaristaHistory initialOrders={orders} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));
      expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
      expect(names()).toEqual(["Bob", "Alice"]);

      await act(() => vi.advanceTimersByTimeAsync(2500));
      expect(screen.getByRole("status")).not.toHaveTextContent(/reconnecting/i);
    });

    it("treats a malformed response as a lost connection", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ nope: true }));
      render(<BaristaHistory initialOrders={orders} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
      expect(names()).toEqual(["Bob", "Alice"]);
    });

    it("sends the barista to sign in when the session expires", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ error: "Unauthorized" }, 401),
      );
      render(<BaristaHistory initialOrders={orders} />);

      await act(() => vi.advanceTimersByTimeAsync(2500));

      expect(routerReplace).toHaveBeenCalledWith(
        "/barista/login?next=%2Fbarista%2Fhistory",
      );
    });

    it("stops polling after unmount", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ orders: [] }));
      const { unmount } = render(<BaristaHistory initialOrders={orders} />);

      unmount();
      await act(() => vi.advanceTimersByTimeAsync(5000));

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
