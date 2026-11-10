import { describe, expect, it } from "vitest";
import { buildCustomerOrders } from "./customerOrders";

function row(
  id: string,
  createdAt: string,
  overrides: Partial<Parameters<typeof buildCustomerOrders>[0][number]> = {},
) {
  return {
    id,
    status: "picked_up" as const,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    drinkName: "Latte",
    optionsJson: { temp: "Hot", sizing: "Large", milk: "Oat" },
    ...overrides,
  };
}

describe("buildCustomerOrders", () => {
  it("lists orders newest first in the API shape", () => {
    const result = buildCustomerOrders([
      row("11111111-2222-4333-a444-555555555555", "2026-11-01T12:00:00Z"),
      row("22222222-2222-4333-a444-555555555555", "2026-11-09T09:30:00Z", {
        status: "cancelled",
        updatedAt: new Date("2026-11-09T09:35:00Z"),
        drinkName: "Espresso",
        optionsJson: { temp: "Hot", sizing: "Double" },
      }),
    ]);

    expect(result).toEqual([
      {
        id: "22222222-2222-4333-a444-555555555555",
        drink_name: "Espresso",
        status: "cancelled",
        options: { sizing: "Double", milk: null, temp: "Hot" },
        created_at: "2026-11-09T09:30:00.000Z",
        updated_at: "2026-11-09T09:35:00.000Z",
      },
      {
        id: "11111111-2222-4333-a444-555555555555",
        drink_name: "Latte",
        status: "picked_up",
        options: { sizing: "Large", milk: "Oat", temp: "Hot" },
        created_at: "2026-11-01T12:00:00.000Z",
        updated_at: "2026-11-01T12:00:00.000Z",
      },
    ]);
  });

  it("keeps in-progress orders so the customer can track them", () => {
    const result = buildCustomerOrders([
      row("11111111-2222-4333-a444-555555555555", "2026-11-10T12:00:00Z", {
        status: "brewing",
      }),
    ]);

    expect(result[0].status).toBe("brewing");
  });

  it("breaks ties on the same time by id, newest first", () => {
    const result = buildCustomerOrders([
      row("aaaaaaaa-2222-4333-a444-555555555555", "2026-11-10T12:00:00Z"),
      row("bbbbbbbb-2222-4333-a444-555555555555", "2026-11-10T12:00:00Z"),
    ]);

    expect(result.map((o) => o.id[0])).toEqual(["b", "a"]);
  });

  it("uses a placeholder when the drink is missing", () => {
    const [order] = buildCustomerOrders([
      row("11111111-2222-4333-a444-555555555555", "2026-11-10T12:00:00Z", {
        drinkName: null,
        optionsJson: null,
      }),
    ]);

    expect(order.drink_name).toBe("Unknown drink");
    expect(order.options).toEqual({ sizing: null, milk: null, temp: null });
  });
});
