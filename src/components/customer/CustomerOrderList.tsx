import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleCheck,
  CircleX,
  Coffee,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { LocalTime } from "@/components/LocalTime";
import { shortOrderId } from "@/lib/domain/history";
import { isActiveStatus } from "@/lib/domain/orderStatus";
import { describeOrderOptions } from "@/lib/domain/queue";
import type { CustomerOrderDto } from "@/lib/schemas/customer";
import type { OrderStatus } from "@/lib/schemas/order";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<
  OrderStatus,
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

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

/** A customer's past orders, newest first (FR-8, US-12). */
export function CustomerOrderList({
  orders,
}: {
  orders: readonly CustomerOrderDto[];
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8 text-center">
        <Coffee
          className="h-10 w-10 text-[var(--muted-foreground)]"
          aria-hidden="true"
        />
        <div>
          <p className="text-lg font-semibold text-[var(--foreground)]">
            No orders yet
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Orders you place while logged in show up here.
          </p>
        </div>
        <Link
          href="/menu"
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
            focusRing,
          )}
        >
          Place an order
        </Link>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order }: { order: CustomerOrderDto }) {
  const badge = STATUS_BADGE[order.status];
  const BadgeIcon = badge.icon;
  const headingId = `my-order-${order.id}`;
  const options = describeOrderOptions(order.options).join(" · ");

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-lg font-semibold text-[var(--foreground)]"
          >
            {order.drink_name}
          </h2>
          {options && (
            <p className="text-sm text-[var(--muted-foreground)]">{options}</p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-sm font-medium text-white",
            badge.className,
          )}
        >
          <BadgeIcon className="h-4 w-4" aria-hidden="true" />
          {badge.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted-foreground)]">
        <span className="font-mono">{shortOrderId(order.id)}</span>
        <LocalTime value={order.created_at} />
      </div>

      {isActiveStatus(order.status) && (
        <Link
          href={`/order/${order.id}`}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-[6px] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)]",
            focusRing,
          )}
        >
          Track order
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
