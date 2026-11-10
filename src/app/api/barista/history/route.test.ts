// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { listFinishedOrders } from "@/lib/db/queries/orders";
import { BARISTA_COOKIE, createBaristaToken } from "@/lib/auth/baristaSession";

vi.mock("@/lib/db/queries/orders", () => ({
  listFinishedOrders: vi.fn(),
}));

function get(token?: string) {
  const headers = new Headers();
  if (token) headers.set("cookie", `${BARISTA_COOKIE}=${token}`);
  return GET(
    new NextRequest("http://localhost/api/barista/history", { headers }),
  );
}

const rows = [
  {
    id: "11111111-2222-4333-a444-555555555555",
    guestName: "Alice",
    status: "picked_up" as const,
    createdAt: new Date("2026-11-10T12:00:00.000Z"),
    finishedAt: new Date("2026-11-10T12:06:00.000Z"),
    drinkName: "Latte",
    optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
  },
  {
    id: "22222222-2222-4333-a444-555555555555",
    guestName: "Bob",
    status: "cancelled" as const,
    createdAt: new Date("2026-11-10T12:02:00.000Z"),
    finishedAt: new Date("2026-11-10T12:08:00.000Z"),
    drinkName: "Espresso",
    optionsJson: { temp: "Hot", sizing: "Double" },
  },
];

describe("GET /api/barista/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 without a barista session", async () => {
    const response = await get();

    expect(response.status).toBe(401);
    expect(listFinishedOrders).not.toHaveBeenCalled();
  });

  it("returns 401 with an invalid token", async () => {
    const response = await get("not-a-jwt");

    expect(response.status).toBe(401);
    expect(listFinishedOrders).not.toHaveBeenCalled();
  });

  it("returns finished orders newest-first with options and times", async () => {
    vi.mocked(listFinishedOrders).mockResolvedValueOnce(rows);

    const response = await get(await createBaristaToken());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      orders: [
        {
          id: "22222222-2222-4333-a444-555555555555",
          guest_name: "Bob",
          drink_name: "Espresso",
          status: "cancelled",
          created_at: "2026-11-10T12:02:00.000Z",
          finished_at: "2026-11-10T12:08:00.000Z",
          options: { sizing: "Double", milk: null, temp: "Hot" },
        },
        {
          id: "11111111-2222-4333-a444-555555555555",
          guest_name: "Alice",
          drink_name: "Latte",
          status: "picked_up",
          created_at: "2026-11-10T12:00:00.000Z",
          finished_at: "2026-11-10T12:06:00.000Z",
          options: { sizing: "Large", milk: "Oat", temp: "Iced" },
        },
      ],
    });
  });

  it("returns an empty list when nothing has finished", async () => {
    vi.mocked(listFinishedOrders).mockResolvedValueOnce([]);

    const response = await get(await createBaristaToken());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ orders: [] });
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(listFinishedOrders).mockRejectedValueOnce(new Error("db down"));

    const response = await get(await createBaristaToken());

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Failed to load history");
  });
});
