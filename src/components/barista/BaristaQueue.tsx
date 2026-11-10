"use client";

import { useState } from "react";
import { CheckCircle2, Coffee, Inbox, type LucideIcon } from "lucide-react";
import {
  filterActiveOrders,
  type ActiveOrderStatus,
} from "@/lib/domain/orderStatus";
import type { OrderStatus } from "@/lib/schemas/order";
import { cn } from "@/lib/utils";
import { OrderStatusActions } from "./OrderStatusActions";

export interface QueueOrder {
  id: string;
  guestName: string;
  drinkName: string;
  status: OrderStatus;
}

export interface BaristaQueueProps {
  initialOrders: QueueOrder[];
}

const STATUS_BADGE: Record<
  ActiveOrderStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  received: {
    label: "Received",
    icon: Inbox,
    className: "bg-[var(--status-received)]",
  },
  brewing: {
    label: "Brewing",
    icon: Coffee,
    className: "bg-[var(--status-brewing)]",
  },
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className: "bg-[var(--status-ready)]",
  },
};

/**
 * Active barista queue. Orders that reach `picked_up` or `cancelled` are
 * removed as soon as the server confirms the update (FR-3, US-4).
 */
export function BaristaQueue({ initialOrders }: BaristaQueueProps) {
  const [orders, setOrders] = useState<QueueOrder[]>(initialOrders);
  const activeOrders = filterActiveOrders(orders);

  function handleStatusChange(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      filterActiveOrders(
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      ),
    );
  }

  if (activeOrders.length === 0) {
    return (
      <p className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8 text-center text-[var(--muted-foreground)]">
        No active orders. New orders will show up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {activeOrders.map((order) => {
        const badge = STATUS_BADGE[order.status];
        const BadgeIcon = badge.icon;
        const headingId = `queue-order-${order.id}`;
        return (
          <li key={order.id}>
            <article
              aria-labelledby={headingId}
              className="flex flex-col gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    id={headingId}
                    className="text-lg font-semibold text-[var(--foreground)]"
                  >
                    {order.guestName}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {order.drinkName}
                  </p>
                </div>
                <span
                  data-testid="queue-status-badge"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-sm font-medium text-white",
                    badge.className,
                  )}
                >
                  <BadgeIcon className="h-4 w-4" aria-hidden="true" />
                  {badge.label}
                </span>
              </div>
              <OrderStatusActions
                orderId={order.id}
                guestName={order.guestName}
                status={order.status}
                onStatusChange={handleStatusChange}
              />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
