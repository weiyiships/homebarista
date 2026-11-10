import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BaristaQueue } from "@/components/barista/BaristaQueue";
import { toQueueOrder, type QueueOrder } from "@/components/barista/queueOrder";
import { BARISTA_COOKIE, verifyBaristaToken } from "@/lib/auth/baristaSession";
import { listActiveOrders } from "@/lib/db/queries/orders";
import { sortOldestFirst, toQueueOrderDto } from "@/lib/domain/queue";

export const dynamic = "force-dynamic";

/**
 * /barista — live queue of active orders, oldest first (FR-3, US-3).
 * Middleware already gates this route; the session is re-checked here.
 */
export default async function BaristaPage() {
  const cookieStore = await cookies();
  const authed = await verifyBaristaToken(
    cookieStore.get(BARISTA_COOKIE)?.value,
  );
  if (!authed) {
    redirect(`/barista/login?next=${encodeURIComponent("/barista")}`);
  }

  let initialOrders: QueueOrder[] = [];
  let loadFailed = false;
  try {
    const rows = await listActiveOrders();
    initialOrders = sortOldestFirst(rows)
      .map(toQueueOrderDto)
      .map(toQueueOrder);
  } catch {
    loadFailed = true;
  }

  return (
    <main className="flex flex-col gap-6 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Barista queue
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Oldest orders first. Updates automatically.
        </p>
      </header>
      <BaristaQueue
        initialOrders={initialOrders}
        initiallyOffline={loadFailed}
      />
    </main>
  );
}
