import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTracker } from "@/components/order/OrderTracker";
import { getOrderTracking } from "@/lib/db/queries/tracking";
import { OrderIdParamSchema, type OrderTracking } from "@/lib/schemas/order";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /order/[id] — live guest status page (FR-4, US-5). Renders the current
 * status on the server, then the client polls every 2.5 s.
 */
export default async function OrderStatusPage({ params }: OrderPageProps) {
  const { id } = await params;
  const idResult = OrderIdParamSchema.safeParse(id);
  if (!idResult.success) notFound();

  let order: OrderTracking | null;
  try {
    order = await getOrderTracking(idResult.data);
  } catch {
    return (
      <main className="flex flex-col gap-4 py-12">
        <p
          role="alert"
          className="rounded-[12px] border border-[var(--status-cancelled)] p-4 text-[var(--foreground)]"
        >
          We couldn’t load your order right now. Refresh the page to try again.
        </p>
        <Link
          href="/menu"
          className="text-sm font-medium text-[var(--primary)] underline"
        >
          Back to menu
        </Link>
      </main>
    );
  }
  if (!order) notFound();

  return (
    <main className="py-8">
      <OrderTracker initialOrder={order} />
    </main>
  );
}
