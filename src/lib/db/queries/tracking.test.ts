import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOrderTracking } from "./tracking";
import { getOrderById, listActiveOrders } from "./orders";

vi.mock("./orders", () => ({
  getOrderById: vi.fn(),
  listActiveOrders: vi.fn(),
}));

const id = "33333333-2222-4333-a444-555555555555";

function stored(status: "received" | "ready" | "cancelled") {
  return {
    id,
    guestName: "Cara",
    customerId: null,
    status,
    createdAt: new Date("2026-11-10T12:02:00.000Z"),
    updatedAt: new Date("2026-11-10T12:04:00.000Z"),
    items: [
      {
        id: "item",
        orderId: id,
        menuItemId: "drink",
        drinkName: "Mocha",
        optionsJson: { temp: "Iced", sizing: "Small", milk: "Oat" },
      },
    ],
  };
}

function activeRow(rowId: string, status: "received" | "brewing", at: string) {
  return {
    id: rowId,
    guestName: "x",
    status,
    createdAt: new Date(at),
    drinkName: "Latte",
    optionsJson: {},
  };
}

describe("getOrderTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for an unknown order", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce(null);
    await expect(getOrderTracking(id)).resolves.toBeNull();
  });

  it("includes how many orders are ahead while received", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce(stored("received"));
    vi.mocked(listActiveOrders).mockResolvedValueOnce([
      activeRow(
        "11111111-2222-4333-a444-555555555555",
        "brewing",
        "2026-11-10T12:00:00Z",
      ),
      activeRow(
        "22222222-2222-4333-a444-555555555555",
        "received",
        "2026-11-10T12:01:00Z",
      ),
      activeRow(id, "received", "2026-11-10T12:02:00Z"),
    ]);

    await expect(getOrderTracking(id)).resolves.toEqual({
      id,
      guest_name: "Cara",
      status: "received",
      drink_name: "Mocha",
      options: { sizing: "Small", milk: "Oat", temp: "Iced" },
      created_at: "2026-11-10T12:02:00.000Z",
      updated_at: "2026-11-10T12:04:00.000Z",
      orders_ahead: 2,
    });
  });

  it("skips the queue lookup once the order is past received", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce(stored("ready"));

    const tracking = await getOrderTracking(id);

    expect(tracking?.orders_ahead).toBeNull();
    expect(listActiveOrders).not.toHaveBeenCalled();
  });

  it("falls back when the drink is missing", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({
      ...stored("cancelled"),
      items: [],
    });

    const tracking = await getOrderTracking(id);

    expect(tracking?.drink_name).toBe("Unknown drink");
    expect(tracking?.options).toEqual({ sizing: null, milk: null, temp: null });
  });
});
