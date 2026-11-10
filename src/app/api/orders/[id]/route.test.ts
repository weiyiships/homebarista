// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getOrderTracking } from "@/lib/db/queries/tracking";

vi.mock("@/lib/db/queries/tracking", () => ({
  getOrderTracking: vi.fn(),
}));

const id = "33333333-2222-4333-a444-555555555555";

function get(orderId: string) {
  return GET(new Request(`http://localhost/api/orders/${orderId}`), {
    params: Promise.resolve({ id: orderId }),
  });
}

const tracking = {
  id,
  guest_name: "Cara",
  status: "received" as const,
  drink_name: "Mocha",
  options: { sizing: "Small", milk: "Oat", temp: "Iced" },
  created_at: "2026-11-10T12:02:00.000Z",
  updated_at: "2026-11-10T12:02:00.000Z",
  orders_ahead: 2,
};

describe("GET /api/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the order's live status without caching", async () => {
    vi.mocked(getOrderTracking).mockResolvedValueOnce(tracking);

    const response = await get(id);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(tracking);
    expect(getOrderTracking).toHaveBeenCalledWith(id);
  });

  it("returns 404 for an unknown order", async () => {
    vi.mocked(getOrderTracking).mockResolvedValueOnce(null);

    const response = await get(id);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Order not found" });
  });

  it("returns 422 for an invalid order id", async () => {
    const response = await get("HB-1234");

    expect(response.status).toBe(422);
    expect((await response.json()).errors[0]).toMatch(/^id/);
    expect(getOrderTracking).not.toHaveBeenCalled();
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(getOrderTracking).mockRejectedValueOnce(new Error("db down"));

    const response = await get(id);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to load order" });
  });
});
