import { getOrderById } from "@/lib/db/queries/orders";
import Link from "next/link";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /order/[id] — Server Component status page (stub for #8).
 * Displays order ID, status badge, and drink name.
 */
export default async function OrderStatusPage({ params }: OrderPageProps) {
  const { id } = await params;

  let order = null;
  try {
    order = await getOrderById(id);
  } catch {
    order = null;
  }

  const orderId = order?.id ?? id;
  const status = order?.status ?? "received";
  const drinkName = order?.items?.[0]?.drinkName ?? "Custom Coffee";
  const guestName = order?.guestName ?? "Guest";

  const statusColors: Record<string, string> = {
    received: "bg-[var(--status-received)]",
    brewing: "bg-[var(--status-brewing)]",
    ready: "bg-[var(--status-ready)]",
    cancelled: "bg-[var(--status-cancelled)]",
  };

  const badgeColor = statusColors[status] ?? "bg-[var(--status-received)]";

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-[640px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full rounded-[12px] border border-[var(--border)] bg-white p-8 shadow-sm dark:bg-stone-900">
        <div className="mb-4 flex items-center justify-center">
          <span
            className={`inline-flex items-center rounded-[6px] px-3 py-1 text-sm font-semibold text-white capitalize ${badgeColor}`}
            data-testid="order-status-badge"
          >
            {status}
          </span>
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {guestName}’s Order
        </h1>

        <p className="mb-6 font-mono text-sm text-[var(--muted-foreground)]">
          Order ID:{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {orderId}
          </span>
        </p>

        <div className="my-6 rounded-[8px] border border-[var(--border)] bg-[var(--background)] p-4 text-left">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {drinkName}
          </h2>
          {Boolean(order?.items?.[0]?.optionsJson) && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {Object.entries(
                (order?.items?.[0]?.optionsJson as Record<string, string>) ??
                  {},
              )
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ")}
            </p>
          )}
        </div>

        <p className="mb-8 text-sm text-[var(--muted-foreground)]">
          Your barista has received your order. This page will update as your
          drink is being prepared.
        </p>

        <Link
          href="/menu"
          className="inline-flex rounded-[6px] border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] dark:bg-stone-900"
        >
          Back to Menu
        </Link>
      </div>
    </main>
  );
}
