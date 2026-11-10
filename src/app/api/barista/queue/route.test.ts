// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { listActiveOrders } from "@/lib/db/queries/orders";
import { BARISTA_COOKIE, createBaristaToken } from "@/lib/auth/baristaSession";

vi.mock("@/lib/db/queries/orders", () => ({
  listActiveOrders: vi.fn(),
}));

function get(token?: string) {
  const headers = new Headers();
  if (token) headers.set("cookie", `${BARISTA_COOKIE}=${token}`);
  return GET(
    new NextRequest("http://localhost/api/barista/queue", { headers }),
  );
}

const rows = [
  {
    id: "22222222-2222-4333-a444-555555555555",
    guestName: "Bob",
    status: "brewing" as const,
    createdAt: new Date("2026-11-10T12:05:00.000Z"),
    drinkName: "Espresso",
    optionsJson: { temp: "Hot", sizing: "Double" },
  },
  {
    id: "11111111-2222-4333-a444-555555555555",
    guestName: "Alice",
    status: "received" as const,
    createdAt: new Date("2026-11-10T12:00:00.000Z"),
    drinkName: "Latte",
    optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
  },
];

describe("GET /api/barista/queue", () => {
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
    expect(listActiveOrders).not.toHaveBeenCalled();
  });

  it("returns 401 for a forged session", async () => {
    const response = await get("forged.token.value");

    expect(response.status).toBe(401);
    expect(listActiveOrders).not.toHaveBeenCalled();
  });

  it("returns active orders oldest-first with all options", async () => {
    vi.mocked(listActiveOrders).mockResolvedValueOnce(rows);

    const response = await get(await createBaristaToken());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      orders: [
        {
          id: "11111111-2222-4333-a444-555555555555",
          guest_name: "Alice",
          drink_name: "Latte",
          status: "received",
          created_at: "2026-11-10T12:00:00.000Z",
          options: { sizing: "Large", milk: "Oat", temp: "Iced" },
        },
        {
          id: "22222222-2222-4333-a444-555555555555",
          guest_name: "Bob",
          drink_name: "Espresso",
          status: "brewing",
          created_at: "2026-11-10T12:05:00.000Z",
          options: { sizing: "Double", milk: null, temp: "Hot" },
        },
      ],
    });
  });

  it("falls back to a placeholder when the drink was removed", async () => {
    vi.mocked(listActiveOrders).mockResolvedValueOnce([
      { ...rows[1], drinkName: null },
    ]);

    const response = await get(await createBaristaToken());

    expect((await response.json()).orders[0].drink_name).toBe("Unknown drink");
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(listActiveOrders).mockRejectedValueOnce(new Error("db down"));

    const response = await get(await createBaristaToken());

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Failed to load queue");
  });
});
