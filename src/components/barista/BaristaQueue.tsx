"use client";

import {
  CheckCircle2,
  Clock,
  Coffee,
  Inbox,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import {
  filterActiveOrders,
  type ActiveOrderStatus,
} from "@/lib/domain/orderStatus";
import {
  describeOrderOptions,
  formatElapsed,
  sortOldestFirst,
} from "@/lib/domain/queue";
import { cn } from "@/lib/utils";
import { OrderStatusActions } from "./OrderStatusActions";
import { useQueuePolling, type QueueOrder } from "./useQueuePolling";

export type { QueueOrder } from "./useQueuePolling";

export interface BaristaQueueProps {
  initialOrders: QueueOrder[];
  /** Start in the "reconnecting" state, e.g. when the first load failed. */
  initiallyOffline?: boolean;
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
 * Live barista queue (FR-3, US-3, US-4): active orders oldest-first, refreshed
 * every 2.5 s. Orders that reach `picked_up` or `cancelled` leave the queue as
 * soon as the server confirms the update.
 */
export function BaristaQueue({
  initialOrders,
  initiallyOffline = false,
}: BaristaQueueProps) {
  const { orders, now, connectionLost, applyStatusChange } = useQueuePolling(
    initialOrders,
    initiallyOffline,
  );
  const activeOrders = sortOldestFirst(filterActiveOrders(orders));

  return (
    <div className="flex flex-col gap-4">
      <p
        role="status"
        className={cn(
          "flex items-center gap-2 text-sm",
          connectionLost
            ? "font-medium text-[var(--status-cancelled)]"
            : "text-[var(--muted-foreground)]",
        )}
      >
        {connectionLost ? (
          <>
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Connection lost. Reconnecting…
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--status-ready)]"
            />
            Live · {activeOrders.length} active{" "}
            {activeOrders.length === 1 ? "order" : "orders"}
          </>
        )}
      </p>

      {activeOrders.length === 0 ? (
        <p className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8 text-center text-[var(--muted-foreground)]">
          No active orders. New orders will show up here.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {activeOrders.map((order) => (
            <li key={order.id}>
              <QueueCard
                order={order}
                now={now}
                onStatusChange={applyStatusChange}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

interface QueueCardProps {
  order: QueueOrder & { status: ActiveOrderStatus };
  now: Date;
  onStatusChange: (orderId: string, status: QueueOrder["status"]) => void;
}

function QueueCard({ order, now, onStatusChange }: QueueCardProps) {
  const badge = STATUS_BADGE[order.status];
  const BadgeIcon = badge.icon;
  const headingId = `queue-order-${order.id}`;
  const optionLabels = describeOrderOptions(order.options);

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="truncate text-lg font-semibold text-[var(--foreground)]"
          >
            {order.guestName}
          </h3>
          <p className="text-base font-medium text-[var(--foreground)]">
            {order.drinkName}
          </p>
        </div>
        <span
          data-testid="queue-status-badge"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-sm font-medium text-white",
            badge.className,
          )}
        >
          <BadgeIcon className="h-4 w-4" aria-hidden="true" />
          {badge.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {optionLabels.length > 0 && (
          <ul aria-label="Options" className="flex flex-wrap gap-2">
            {optionLabels.map((label) => (
              <li
                key={label}
                className="rounded-[6px] border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-sm text-[var(--foreground)]"
              >
                {label}
              </li>
            ))}
          </ul>
        )}
        <p className="ml-auto flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] tabular-nums">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Waiting</span>
          <time dateTime={order.createdAt}>
            {formatElapsed(order.createdAt, now)}
          </time>
        </p>
      </div>

      <OrderStatusActions
        orderId={order.id}
        guestName={order.guestName}
        status={order.status}
        onStatusChange={onStatusChange}
      />
    </article>
  );
}
