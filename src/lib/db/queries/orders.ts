import { and, eq, sql } from "drizzle-orm";
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

/**
 * Returns the current status of an order, or null when it does not exist.
 */
export async function getOrderStatus(
  id: string,
): Promise<Order["status"] | null> {
  const [row] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return row?.status ?? null;
}

/**
 * Atomically moves an order from `from` to `to`. Returns null when the order's
 * status is no longer `from` (e.g. a double tap or a second device got there
 * first), so callers never apply a transition to a stale status.
 */
export async function updateOrderStatusIfCurrent(
  id: string,
  from: Order["status"],
  to: Order["status"],
): Promise<Order | null> {
  const [order] = await db
    .update(orders)
    .set({ status: to, updatedAt: sql`now()` })
    .where(and(eq(orders.id, id), eq(orders.status, from)))
    .returning();

  return order ?? null;
}
