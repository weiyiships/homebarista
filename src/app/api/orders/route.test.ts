import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { createOrder } from "@/lib/db/queries/orders";
import { getMenuItemById, listMilkOptions } from "@/lib/db/queries/menu";

vi.mock("@/lib/db/queries/orders", () => ({
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
}));

vi.mock("@/lib/db/queries/menu", () => ({
  getMenuItemById: vi.fn(),
  listMilkOptions: vi.fn(),
}));

function orderRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders route handler", () => {
  const validDrinkId = "11111111-2222-4333-a444-555555555555";
  const latte = {
    id: validDrinkId,
    name: "Latte",
    available: true,
    takesMilk: true,
    sizeType: "size" as const,
  };
  const milks = [
    {
      id: "22222222-2222-4333-a444-555555555555",
      type: "milk" as const,
      label: "Whole",
      available: true,
    },
    {
      id: "33333333-2222-4333-a444-555555555555",
      type: "milk" as const,
      label: "Oat",
      available: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMenuItemById).mockResolvedValue(latte);
    vi.mocked(listMilkOptions).mockResolvedValue(milks);
  });

  describe("availability (FR-5)", () => {
    it("returns 409 and does not create an order when the drink is off", async () => {
      vi.mocked(getMenuItemById).mockResolvedValueOnce({
        ...latte,
        available: false,
      });

      const response = await POST(
        orderRequest({
          guest_name: "Alice",
          drink_id: validDrinkId,
          options: { temp: "Hot", sizing: "Small", milk: "Whole" },
        }),
      );

      expect(response.status).toBe(409);
      expect((await response.json()).error).toBe(
        "Latte is no longer available. Please choose another drink.",
      );
      expect(createOrder).not.toHaveBeenCalled();
    });

    it("returns 409 and does not create an order when the milk is off", async () => {
      const response = await POST(
        orderRequest({
          guest_name: "Alice",
          drink_id: validDrinkId,
          options: { temp: "Hot", sizing: "Small", milk: "Oat" },
        }),
      );

      expect(response.status).toBe(409);
      expect((await response.json()).error).toBe(
        "Oat milk is no longer available. Please choose another milk.",
      );
      expect(createOrder).not.toHaveBeenCalled();
    });

    it("returns 422 when the drink does not exist", async () => {
      vi.mocked(getMenuItemById).mockResolvedValueOnce(null);

      const response = await POST(
        orderRequest({ guest_name: "Alice", drink_id: validDrinkId }),
      );

      expect(response.status).toBe(422);
      expect((await response.json()).errors).toEqual([
        "That drink is not on the menu.",
      ]);
      expect(createOrder).not.toHaveBeenCalled();
    });

    it("looks up the requested drink by id", async () => {
      vi.mocked(createOrder).mockResolvedValueOnce({
        id: "order-uuid-123",
        guestName: "Alice",
        customerId: null,
        status: "received",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await POST(
        orderRequest({
          guest_name: "Alice",
          drink_id: validDrinkId,
          options: { temp: "Hot", sizing: "Small", milk: "Whole" },
        }),
      );

      expect(getMenuItemById).toHaveBeenCalledWith(validDrinkId);
      expect(createOrder).toHaveBeenCalledTimes(1);
    });

    it("returns 500 when the availability lookup fails", async () => {
      vi.mocked(getMenuItemById).mockRejectedValueOnce(new Error("db down"));

      const response = await POST(
        orderRequest({ guest_name: "Alice", drink_id: validDrinkId }),
      );

      expect(response.status).toBe(500);
      expect(createOrder).not.toHaveBeenCalled();
    });
  });

  it("happy path returns 201 with created order id", async () => {
    vi.mocked(createOrder).mockResolvedValueOnce({
      id: "order-uuid-123",
      guestName: "Alice",
      customerId: null,
      status: "received",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_name: "Alice",
        drink_id: validDrinkId,
        options: { temp: "Hot", sizing: "Single" },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.id).toBe("order-uuid-123");
    expect(json.status).toBe("received");
    expect(createOrder).toHaveBeenCalledWith({
      guestName: "Alice",
      drinkId: validDrinkId,
      options: { temp: "Hot", sizing: "Single" },
      customerId: undefined,
    });
  });

  it("returns 422 when guest_name is missing", async () => {
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drink_id: validDrinkId,
        options: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const json = await response.json();
    expect(json.errors).toBeDefined();
    expect(
      json.errors.some((e: string) => e.toLowerCase().includes("guest name")),
    ).toBe(true);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("returns 422 when drink_id is not a valid UUID", async () => {
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_name: "Bob",
        drink_id: "invalid-uuid",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const json = await response.json();
    expect(json.errors).toBeDefined();
    expect(
      json.errors.some(
        (e: string) =>
          e.toLowerCase().includes("drink id") ||
          e.toLowerCase().includes("uuid"),
      ),
    ).toBe(true);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("returns 500 when database insert fails", async () => {
    vi.mocked(createOrder).mockRejectedValueOnce(
      new Error("Database connection error"),
    );

    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_name: "Charlie",
        drink_id: validDrinkId,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe("Failed to create order");
  });

  it("returns 422 when JSON is malformed", async () => {
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json string",
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });
});
