import type { CustomerOrderDto } from "@/lib/schemas/customer";
import type { OrderStatus } from "@/lib/schemas/order";
import { parseOrderOptions } from "./queue";

/**
 * Pure rules for a customer's "My orders" page (FR-8, US-12).
 */

export interface StoredCustomerOrderRow {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  drinkName: string | null;
  optionsJson: unknown;
}

/** Newest first; ties on time fall back to id so the order is stable. */
function newestFirst(a: StoredCustomerOrderRow, b: StoredCustomerOrderRow) {
  const diff = b.createdAt.getTime() - a.createdAt.getTime();
  if (diff !== 0) return diff;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/** Builds the customer's order history in the API shape, newest first. */
export function buildCustomerOrders(
  rows: readonly StoredCustomerOrderRow[],
): CustomerOrderDto[] {
  return [...rows].sort(newestFirst).map((row) => ({
    id: row.id,
    drink_name: row.drinkName ?? "Unknown drink",
    status: row.status,
    options: parseOrderOptions(row.optionsJson),
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  }));
}
