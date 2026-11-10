// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { listOrdersForCustomer } from "@/lib/db/queries/orders";
import {
  CUSTOMER_COOKIE,
  createCustomerToken,
} from "@/lib/auth/customerSession";
import { createBaristaToken } from "@/lib/auth/baristaSession";

vi.mock("@/lib/db/queries/orders", () => ({
  listOrdersForCustomer: vi.fn(),
}));

const alice = { id: "11111111-2222-4333-a444-555555555555", name: "Alice" };
const bobId = "22222222-2222-4333-a444-555555555555";

function get(cookie?: string, query = "") {
  return GET(
    new Request(`http://localhost/api/customers/me/orders${query}`, {
      headers: cookie ? { cookie } : {},
    }),
  );
}

describe("GET /api/customers/me/orders", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns 401 without a customer session", async () => {
    const response = await get();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Log in to see your orders",
    });
    expect(listOrdersForCustomer).not.toHaveBeenCalled();
  });

  it("rejects a barista session", async () => {
    const token = await createBaristaToken();
    const response = await get(
      `hb_barista_session=${token}; ${CUSTOMER_COOKIE}=${token}`,
    );

    expect(response.status).toBe(401);
    expect(listOrdersForCustomer).not.toHaveBeenCalled();
  });

  it("returns only the signed-in customer's orders, newest first", async () => {
    vi.mocked(listOrdersForCustomer).mockResolvedValueOnce([
      {
        id: "aaaaaaaa-2222-4333-a444-555555555555",
        status: "picked_up",
        createdAt: new Date("2026-11-01T12:00:00Z"),
        updatedAt: new Date("2026-11-01T12:10:00Z"),
        drinkName: "Latte",
        optionsJson: { temp: "Hot", sizing: "Large", milk: "Oat" },
      },
      {
        id: "bbbbbbbb-2222-4333-a444-555555555555",
        status: "cancelled",
        createdAt: new Date("2026-11-09T12:00:00Z"),
        updatedAt: new Date("2026-11-09T12:01:00Z"),
        drinkName: "Mocha",
        optionsJson: {},
      },
    ]);
    const token = await createCustomerToken(alice);

    const response = await get(`${CUSTOMER_COOKIE}=${token}`);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(listOrdersForCustomer).toHaveBeenCalledWith(alice.id);
    const json = await response.json();
    expect(json.orders.map((o: { id: string }) => o.id[0])).toEqual(["b", "a"]);
  });

  it("ignores any attempt to name another customer", async () => {
    vi.mocked(listOrdersForCustomer).mockResolvedValueOnce([]);
    const token = await createCustomerToken(alice);

    await get(
      `${CUSTOMER_COOKIE}=${token}`,
      `?customer_id=${bobId}&id=${bobId}`,
    );

    expect(listOrdersForCustomer).toHaveBeenCalledTimes(1);
    expect(listOrdersForCustomer).toHaveBeenCalledWith(alice.id);
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(listOrdersForCustomer).mockRejectedValueOnce(new Error("db"));
    const token = await createCustomerToken(alice);

    const response = await get(`${CUSTOMER_COOKIE}=${token}`);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to load your orders",
    });
  });
});
