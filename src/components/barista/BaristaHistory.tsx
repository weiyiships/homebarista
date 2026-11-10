"use client";

import { useSyncExternalStore } from "react";
import { CircleCheck, CircleX, WifiOff, type LucideIcon } from "lucide-react";
import {
  countHistory,
  formatClockTime,
  shortOrderId,
  sortNewestFinishedFirst,
  type FinishedOrderStatus,
} from "@/lib/domain/history";
import { describeOrderOptions } from "@/lib/domain/queue";
import { cn } from "@/lib/utils";
import type { HistoryOrder } from "./historyOrder";
import { useHistoryPolling } from "./useHistoryPolling";

export type { HistoryOrder } from "./historyOrder";

export interface BaristaHistoryProps {
  initialOrders: HistoryOrder[];
  /** Start in the "reconnecting" state, e.g. when the first load failed. */
  initiallyOffline?: boolean;
}

const STATUS_BADGE: Record<
  FinishedOrderStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  picked_up: {
    label: "Picked up",
    icon: CircleCheck,
    className: "bg-[var(--status-ready)]",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleX,
    className: "bg-[var(--status-cancelled)]",
  },
};

/**
 * Barista order history (FR-6, US-7): picked-up and cancelled orders, newest
 * first, with counts. Refreshed every 2.5 s so it follows the live queue.
 */
export function BaristaHistory({
  initialOrders,
  initiallyOffline = false,
}: BaristaHistoryProps) {
  const { orders, connectionLost } = useHistoryPolling(
    initialOrders,
    initiallyOffline,
  );
  const sorted = sortNewestFinishedFirst(orders);
  const counts = countHistory(sorted);

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
            Live · newest first
          </>
        )}
      </p>

      <ul
        aria-label="History summary"
        className="grid grid-cols-3 gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
      >
        <SummaryStat label="Total" value={counts.total} />
        <SummaryStat label="Picked up" value={counts.pickedUp} />
        <SummaryStat label="Cancelled" value={counts.cancelled} />
      </ul>

      {sorted.length === 0 ? (
        <p className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8 text-center text-[var(--muted-foreground)]">
          No finished orders yet. Picked-up and cancelled orders will show up
          here.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {sorted.map((order) => (
            <li key={order.id}>
              <HistoryCard order={order} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-2xl font-semibold text-[var(--foreground)] tabular-nums">
        {value}
      </span>
    </li>
  );
}

function HistoryCard({ order }: { order: HistoryOrder }) {
  const badge = STATUS_BADGE[order.status];
  const BadgeIcon = badge.icon;
  const headingId = `history-order-${order.id}`;
  const optionLabels = describeOrderOptions(order.options);

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="truncate text-lg font-semibold text-[var(--foreground)]"
          >
            {order.guestName}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] tabular-nums">
            <span className="sr-only">Order </span>
            {shortOrderId(order.id)}
          </p>
        </div>
        <span
          data-testid="history-status-badge"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-sm font-medium text-white",
            badge.className,
          )}
        >
          <BadgeIcon className="h-4 w-4" aria-hidden="true" />
          {badge.label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-[var(--foreground)]">
          {order.drinkName}
        </p>
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
      </div>

      <dl className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3 text-sm">
        <TimeEntry label="Ordered" value={order.createdAt} />
        <TimeEntry label={badge.label} value={order.finishedAt} />
      </dl>
    </article>
  );
}

const subscribeNever = () => () => {};

/**
 * Renders a timestamp in the viewer's time zone. The server does not know
 * that zone, so the text is filled in after hydration to avoid a mismatch.
 */
function TimeEntry({ label, value }: { label: string; value: string }) {
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-medium text-[var(--foreground)] tabular-nums">
        <time dateTime={value}>{isClient ? formatClockTime(value) : ""}</time>
      </dd>
    </div>
  );
}
