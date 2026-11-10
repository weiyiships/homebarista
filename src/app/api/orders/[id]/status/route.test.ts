import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";
import {
  getOrderStatus,
  updateOrderStatusIfCurrent,
} from "@/lib/db/queries/orders";
import type { Order } from "@/lib/db/schema";

vi.mock("@/lib/db/queries/orders", () => ({
  getOrderStatus: vi.fn(),
  updateOrderStatusIfCurrent: vi.fn(),
}));

const orderId = "11111111-2222-4333-a444-555555555555";

function patch(id: string, body: unknown) {
  const request = new Request(`http://localhost/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return PATCH(request, { params: Promise.resolve({ id }) });
}

function order(status: Order["status"]): Order {
  const now = new Date("2026-11-10T12:00:00.000Z");
  return {
    id: orderId,
    guestName: "Alice",
    customerId: null,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

describe("PATCH /api/orders/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("advances received to brewing and persists it", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce("received");
    vi.mocked(updateOrderStatusIfCurrent).mockResolvedValueOnce(
      order("brewing"),
    );

    const response = await patch(orderId, { action: "advance" });

    expect(response.status).toBe(200);
    expect(updateOrderStatusIfCurrent).toHaveBeenCalledWith(
      orderId,
      "received",
      "brewing",
    );
    const json = await response.json();
    expect(json).toEqual({
      id: orderId,
      status: "brewing",
      updated_at: "2026-11-10T12:00:00.000Z",
    });
  });

  it("advances ready to picked_up", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce("ready");
    vi.mocked(updateOrderStatusIfCurrent).mockResolvedValueOnce(
      order("picked_up"),
    );

    const response = await patch(orderId, { action: "advance" });

    expect(response.status).toBe(200);
    expect(updateOrderStatusIfCurrent).toHaveBeenCalledWith(
      orderId,
      "ready",
      "picked_up",
    );
  });

  it("cancels an active order", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce("brewing");
    vi.mocked(updateOrderStatusIfCurrent).mockResolvedValueOnce(
      order("cancelled"),
    );

    const response = await patch(orderId, { action: "cancel" });

    expect(response.status).toBe(200);
    expect(updateOrderStatusIfCurrent).toHaveBeenCalledWith(
      orderId,
      "brewing",
      "cancelled",
    );
    expect((await response.json()).status).toBe("cancelled");
  });

  it("returns 409 when the order is already finished", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce("picked_up");

    const response = await patch(orderId, { action: "cancel" });

    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/already picked up/i);
    expect(updateOrderStatusIfCurrent).not.toHaveBeenCalled();
  });

  it("returns 409 when the status changed concurrently", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce("received");
    vi.mocked(updateOrderStatusIfCurrent).mockResolvedValueOnce(null);

    const response = await patch(orderId, { action: "advance" });

    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/changed/i);
  });

  it("returns 404 when the order does not exist", async () => {
    vi.mocked(getOrderStatus).mockResolvedValueOnce(null);

    const response = await patch(orderId, { action: "advance" });

    expect(response.status).toBe(404);
    expect(updateOrderStatusIfCurrent).not.toHaveBeenCalled();
  });

  it("returns 422 for an invalid order id", async () => {
    const response = await patch("not-a-uuid", { action: "advance" });

    expect(response.status).toBe(422);
    expect(getOrderStatus).not.toHaveBeenCalled();
  });

  it("returns 422 for an unknown action", async () => {
    const response = await patch(orderId, { action: "picked_up" });

    expect(response.status).toBe(422);
    const json = await response.json();
    expect(json.errors.some((e: string) => e.startsWith("action"))).toBe(true);
    expect(getOrderStatus).not.toHaveBeenCalled();
  });

  it("returns 422 for malformed JSON", async () => {
    const response = await patch(orderId, "{ nope");

    expect(response.status).toBe(422);
    expect((await response.json()).errors).toEqual(["Invalid JSON payload"]);
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(getOrderStatus).mockRejectedValueOnce(new Error("db down"));

    const response = await patch(orderId, { action: "advance" });

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Failed to update order");
  });
});
