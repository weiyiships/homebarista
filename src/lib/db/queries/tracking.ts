import { parseOrderOptions } from "@/lib/domain/queue";
import { countOrdersAhead } from "@/lib/domain/tracking";
import type { OrderTracking } from "@/lib/schemas/order";
import { getOrderById, listActiveOrders } from "./orders";

/**
 * Loads what the guest status page shows for one order (FR-4, US-5).
 * Queue position is only looked up while the order is `received`.
 */
export async function getOrderTracking(
  id: string,
): Promise<OrderTracking | null> {
  const order = await getOrderById(id);
  if (!order) return null;

  const item = order.items[0];
  const ordersAhead =
    order.status === "received"
      ? countOrdersAhead(order.id, await listActiveOrders())
      : null;

  return {
    id: order.id,
    guest_name: order.guestName,
    status: order.status,
    drink_name: item?.drinkName ?? "Unknown drink",
    options: parseOrderOptions(item?.optionsJson),
    created_at: order.createdAt.toISOString(),
    updated_at: order.updatedAt.toISOString(),
    orders_ahead: ordersAhead,
  };
}
