import type { HistoryOrderDto } from "@/lib/schemas/barista";
import type { OrderStatus } from "@/lib/schemas/order";
import { parseOrderOptions } from "./queue";

/**
 * Pure rules for the barista order history (FR-6, US-7).
 */

export type FinishedOrderStatus = Extract<
  OrderStatus,
  "picked_up" | "cancelled"
>;

export const FINISHED_ORDER_STATUSES: readonly FinishedOrderStatus[] = [
  "picked_up",
  "cancelled",
];

type Timestamp = string | Date;

function toMillis(value: Timestamp): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

export function isFinishedStatus(
  status: OrderStatus,
): status is FinishedOrderStatus {
  return (FINISHED_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

/**
 * Returns a copy sorted by finish time, newest first. Ties fall back to the
 * newest order time, then to input order.
 */
export function sortNewestFinishedFirst<
  T extends { createdAt: Timestamp; finishedAt: Timestamp },
>(orders: readonly T[]): T[] {
  return [...orders].sort(
    (a, b) =>
      toMillis(b.finishedAt) - toMillis(a.finishedAt) ||
      toMillis(b.createdAt) - toMillis(a.createdAt),
  );
}

export interface HistoryCounts {
  total: number;
  pickedUp: number;
  cancelled: number;
}

export function countHistory(
  orders: readonly { status: OrderStatus }[],
): HistoryCounts {
  let pickedUp = 0;
  let cancelled = 0;
  for (const order of orders) {
    if (order.status === "picked_up") pickedUp += 1;
    else if (order.status === "cancelled") cancelled += 1;
  }
  return { total: pickedUp + cancelled, pickedUp, cancelled };
}

/** Short display reference for an order UUID, e.g. `#1A2B3C`. */
export function shortOrderId(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** Short date and time, e.g. `Nov 10, 5:05 PM`. Defaults to local time. */
export function formatClockTime(value: Timestamp, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(toMillis(value)));
}

export interface StoredHistoryRow {
  id: string;
  guestName: string;
  status: OrderStatus;
  createdAt: Date;
  /** When the order reached its final status. */
  finishedAt: Date;
  drinkName: string | null;
  optionsJson: unknown;
}

/**
 * Builds the GET /api/barista/history list: finished orders only, newest
 * first, in the API shape.
 */
export function buildHistory(
  rows: readonly StoredHistoryRow[],
): HistoryOrderDto[] {
  const finished = rows.filter(
    (row): row is StoredHistoryRow & { status: FinishedOrderStatus } =>
      isFinishedStatus(row.status),
  );
  return sortNewestFinishedFirst(finished).map((row) => ({
    id: row.id,
    guest_name: row.guestName,
    drink_name: row.drinkName ?? "Unknown drink",
    status: row.status,
    created_at: row.createdAt.toISOString(),
    finished_at: row.finishedAt.toISOString(),
    options: parseOrderOptions(row.optionsJson),
  }));
}
