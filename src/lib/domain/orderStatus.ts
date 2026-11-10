import type { OrderStatus } from "@/lib/schemas/order";

/**
 * Order status state machine (FR-3, US-4).
 *
 *   received -> brewing -> ready -> picked_up
 *        \_________\_________\____-> cancelled
 *
 * `picked_up` and `cancelled` are terminal.
 */

export type ActiveOrderStatus = Extract<
  OrderStatus,
  "received" | "brewing" | "ready"
>;

export type StatusAction = "advance" | "cancel";

export const ACTIVE_ORDER_STATUSES: readonly ActiveOrderStatus[] = [
  "received",
  "brewing",
  "ready",
];

const NEXT_STATUS: Record<ActiveOrderStatus, OrderStatus> = {
  received: "brewing",
  brewing: "ready",
  ready: "picked_up",
};

const NEXT_ACTION_LABEL: Record<ActiveOrderStatus, string> = {
  received: "Start brewing",
  brewing: "Mark ready",
  ready: "Mark picked up",
};

const TERMINAL_STATUS_LABEL: Record<
  Exclude<OrderStatus, ActiveOrderStatus>,
  string
> = {
  picked_up: "picked up",
  cancelled: "cancelled",
};

export function isActiveStatus(
  status: OrderStatus,
): status is ActiveOrderStatus {
  return (ACTIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

/** The status one tap advances to, or null when the order is finished. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  return isActiveStatus(status) ? NEXT_STATUS[status] : null;
}

/** Button label for the one-tap advance action, or null when finished. */
export function nextActionLabel(status: OrderStatus): string | null {
  return isActiveStatus(status) ? NEXT_ACTION_LABEL[status] : null;
}

export type StatusTransitionResult =
  | { ok: true; from: OrderStatus; to: OrderStatus }
  | { ok: false; error: string };

/** Resolves a barista action against the current status. */
export function resolveStatusTransition(
  current: OrderStatus,
  action: StatusAction,
): StatusTransitionResult {
  if (!isActiveStatus(current)) {
    return {
      ok: false,
      error: `Order is already ${TERMINAL_STATUS_LABEL[current]}`,
    };
  }

  return {
    ok: true,
    from: current,
    to: action === "cancel" ? "cancelled" : NEXT_STATUS[current],
  };
}

/** Keeps only orders that belong in the live barista queue. */
export function filterActiveOrders<T extends { status: OrderStatus }>(
  orders: readonly T[],
): Array<T & { status: ActiveOrderStatus }> {
  return orders.filter((order): order is T & { status: ActiveOrderStatus } =>
    isActiveStatus(order.status),
  );
}
