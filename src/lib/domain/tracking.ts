import type { OrderStatus } from "@/lib/schemas/order";

/**
 * Pure rules for the guest order status page (FR-4, US-5).
 */

type Timestamp = string | Date;

function toMillis(value: Timestamp): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

interface QueueEntry {
  id: string;
  status: OrderStatus;
  createdAt: Timestamp;
}

/** Statuses of orders the barista still has to make. */
const WAITING_TO_BE_MADE: readonly OrderStatus[] = ["received", "brewing"];

/** Same ordering as the barista queue: arrival time, then id. */
function arrivedBefore(a: QueueEntry, b: QueueEntry): boolean {
  const diff = toMillis(a.createdAt) - toMillis(b.createdAt);
  return diff < 0 || (diff === 0 && a.id < b.id);
}

/**
 * How many orders the barista will make before this one: earlier orders that
 * are still `received` or `brewing`. Returns null when the order isn't listed.
 */
export function countOrdersAhead(
  orderId: string,
  queue: readonly QueueEntry[],
): number | null {
  const target = queue.find((order) => order.id === orderId);
  if (!target) return null;

  return queue.filter(
    (order) =>
      order.id !== orderId &&
      WAITING_TO_BE_MADE.includes(order.status) &&
      arrivedBefore(order, target),
  ).length;
}

export function formatQueuePosition(ordersAhead: number): string {
  if (ordersAhead <= 0) return "You're next";
  return `${ordersAhead} ${ordersAhead === 1 ? "order" : "orders"} ahead of you`;
}

type TrackedStatus = Exclude<OrderStatus, "cancelled">;

const STEPS: ReadonlyArray<{ status: TrackedStatus; label: string }> = [
  { status: "received", label: "Received" },
  { status: "brewing", label: "Brewing" },
  { status: "ready", label: "Ready" },
  { status: "picked_up", label: "Picked up" },
];

export interface TrackingStep {
  status: TrackedStatus;
  label: string;
  state: "complete" | "current" | "upcoming";
}

/** Stepper model for the status page. Cancelled orders have no progress. */
export function trackingSteps(status: OrderStatus): TrackingStep[] {
  const currentIndex = STEPS.findIndex((step) => step.status === status);
  if (currentIndex === -1) return [];

  return STEPS.map((step, index) => ({
    ...step,
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}
