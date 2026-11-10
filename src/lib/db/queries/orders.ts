import { eq } from "drizzle-orm";
import { db } from "../index";
import { menuItems, orderItems, orders, type Order } from "../schema";

export interface CreateOrderInput {
  guestName: string;
  drinkId: string;
  options?: Record<string, unknown>;
  customerId?: string | null;
}

/**
 * Creates a new order and associated order_item record.
 */
export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const [order] = await db
    .insert(orders)
    .values({
      guestName: data.guestName,
      customerId: data.customerId ?? null,
      status: "received",
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    menuItemId: data.drinkId,
    optionsJson: data.options ?? {},
  });

  return order;
}

/**
 * Fetches an order by its ID, including related order items and drink information.
 */
export async function getOrderById(id: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      menuItemId: orderItems.menuItemId,
      optionsJson: orderItems.optionsJson,
      drinkName: menuItems.name,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    ...order,
    items,
  };
}
