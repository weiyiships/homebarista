import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/db/queries/orders";
import { orderItems, orders } from "@/lib/db/schema";
import { drinkId } from "./support/http";

describe("createOrder", () => {
  it("writes the order and its item together", async () => {
    const order = await createOrder({
      guestName: "Grace",
      drinkId: await drinkId("Latte"),
      options: { milk: "Oat" },
    });

    const items = await db.select().from(orderItems);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      orderId: order.id,
      optionsJson: { milk: "Oat" },
    });
  });

  it("leaves no order behind when the item insert fails", async () => {
    // Passes the route's availability check in a race, then the drink is
    // gone: the order_items foreign key rejects it.
    const deletedDrink = "00000000-0000-4000-8000-000000000000";

    await expect(
      createOrder({ guestName: "Grace", drinkId: deletedDrink }),
    ).rejects.toThrow();

    expect(await db.select().from(orders)).toEqual([]);
    expect(await db.select().from(orderItems)).toEqual([]);
  });
});
