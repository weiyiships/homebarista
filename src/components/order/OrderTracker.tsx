"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Coffee,
  Inbox,
  PackageCheck,
  WifiOff,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { describeOrderOptions } from "@/lib/domain/queue";
import { formatQueuePosition, trackingSteps } from "@/lib/domain/tracking";
import type { OrderStatus, OrderTracking } from "@/lib/schemas/order";
import { cn } from "@/lib/utils";
import { useOrderPolling } from "./useOrderPolling";

export interface OrderTrackerProps {
  initialOrder: OrderTracking;
}

const STATUS_DISPLAY: Record<
  OrderStatus,
  { label: string; announcement: string; icon: LucideIcon; className: string }
> = {
  received: {
    label: "Received",
    announcement: "Your order is received.",
    icon: Inbox,
    className: "bg-[var(--status-received)]",
  },
  brewing: {
    label: "Brewing",
    announcement: "Your order is brewing.",
    icon: Coffee,
    className: "bg-[var(--status-brewing)]",
  },
  ready: {
    label: "Ready",
    announcement: "Your order is ready for pickup.",
    icon: CheckCircle2,
    className: "bg-[var(--status-ready)]",
  },
  picked_up: {
    label: "Picked up",
    announcement: "Your order has been picked up. Enjoy!",
    icon: PackageCheck,
    className: "bg-[var(--status-ready)]",
  },
  cancelled: {
    label: "Cancelled",
    announcement: "Your order was cancelled.",
    icon: XCircle,
    className: "bg-[var(--status-cancelled)]",
  },
};

const secondaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

/** Live guest status page body (FR-4, US-5). */
export function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const { order, connectionLost } = useOrderPolling(initialOrder);
  const announcement = useStatusAnnouncement(order.status);
  const display = STATUS_DISPLAY[order.status];
  const BadgeIcon = display.icon;
  const steps = trackingSteps(order.status);
  const options = describeOrderOptions(order.options).join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {connectionLost && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[6px] border border-[var(--status-cancelled)] p-3 text-sm font-medium text-[var(--status-cancelled)]"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          Connection lost. Reconnecting…
        </p>
      )}

      <header className="flex flex-col items-start gap-3">
        <span
          data-testid="order-status-badge"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-sm font-medium text-white",
            display.className,
          )}
        >
          <BadgeIcon className="h-4 w-4" aria-hidden="true" />
          {display.label}
        </span>
        <h1 className="text-4xl font-bold tracking-tight break-words text-[var(--foreground)]">
          {order.guest_name}’s order
        </h1>
        <p className="font-mono text-xs break-all text-[var(--muted-foreground)]">
          Order ID: {order.id}
        </p>
      </header>

      {order.status === "ready" && (
        <section
          aria-labelledby="ready-banner"
          className="flex items-start gap-4 rounded-[12px] border-2 border-[var(--status-ready)] bg-[var(--muted)] p-5"
        >
          <CheckCircle2
            className="h-10 w-10 shrink-0 text-[var(--status-ready)]"
            aria-hidden="true"
          />
          <div>
            <h2
              id="ready-banner"
              className="text-2xl font-semibold text-[var(--foreground)]"
            >
              Your drink is ready!
            </h2>
            <p className="mt-1 text-[var(--foreground)]">
              Pick it up at the bar.
            </p>
          </div>
        </section>
      )}

      {order.status === "cancelled" && (
        <section
          aria-labelledby="cancelled-banner"
          className="flex items-start gap-4 rounded-[12px] border-2 border-[var(--status-cancelled)] bg-[var(--muted)] p-5"
        >
          <XCircle
            className="h-10 w-10 shrink-0 text-[var(--status-cancelled)]"
            aria-hidden="true"
          />
          <div>
            <h2
              id="cancelled-banner"
              className="text-2xl font-semibold text-[var(--foreground)]"
            >
              This order was cancelled
            </h2>
            <p className="mt-1 text-[var(--foreground)]">
              Check with the host, or place a new order.
            </p>
          </div>
        </section>
      )}

      {order.status === "received" && order.orders_ahead !== null && (
        <p className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4 text-center text-xl font-semibold text-[var(--foreground)]">
          {formatQueuePosition(order.orders_ahead)}
        </p>
      )}

      {steps.length > 0 && (
        <ol aria-label="Order progress" className="grid grid-cols-4 gap-2">
          {steps.map((step) => (
            <li
              key={step.status}
              aria-current={step.state === "current" ? "step" : undefined}
              className="flex flex-col items-center gap-2 text-center text-xs font-medium"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[6px] border-2",
                  step.state === "upcoming"
                    ? "border-[var(--border)] text-[var(--muted-foreground)]"
                    : "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]",
                  step.state === "current" &&
                    "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]",
                )}
              >
                {step.state === "complete" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="h-2 w-2 rounded-[2px] bg-current" />
                )}
              </span>
              <span
                className={
                  step.state === "upcoming"
                    ? "text-[var(--muted-foreground)]"
                    : "text-[var(--foreground)]"
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      )}

      <section
        aria-label="Order summary"
        className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {order.drink_name}
        </h2>
        {options && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {options}
          </p>
        )}
      </section>

      <Link href="/menu" className={cn(secondaryLink, "self-start")}>
        Back to menu
      </Link>
    </div>
  );
}

/** Text for the polite live region; empty until the status changes. */
function useStatusAnnouncement(status: OrderStatus): string {
  const previous = useRef(status);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (previous.current !== status) {
      previous.current = status;
      setAnnouncement(STATUS_DISPLAY[status].announcement);
    }
  }, [status]);

  return announcement;
}
