import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BaristaHistory } from "@/components/barista/BaristaHistory";
import { BaristaNav } from "@/components/barista/BaristaNav";
import {
  toHistoryOrder,
  type HistoryOrder,
} from "@/components/barista/historyOrder";
import { BARISTA_COOKIE, verifyBaristaToken } from "@/lib/auth/baristaSession";
import { listFinishedOrders } from "@/lib/db/queries/orders";
import { buildHistory } from "@/lib/domain/history";
import { PAGE_LIST } from "@/components/site/layout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * /barista/history: picked-up and cancelled orders, newest first (FR-6,
 * US-7). Middleware already gates this route; the session is re-checked here.
 */
export default async function BaristaHistoryPage() {
  const cookieStore = await cookies();
  const authed = await verifyBaristaToken(
    cookieStore.get(BARISTA_COOKIE)?.value,
  );
  if (!authed) {
    redirect(`/barista/login?next=${encodeURIComponent("/barista/history")}`);
  }

  let initialOrders: HistoryOrder[] = [];
  let loadFailed = false;
  try {
    initialOrders = buildHistory(await listFinishedOrders()).map(
      toHistoryOrder,
    );
  } catch {
    loadFailed = true;
  }

  return (
    <main className={cn(PAGE_LIST, "flex flex-col gap-6 py-6")}>
      <BaristaNav current="history" />
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Order history
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Picked-up and cancelled orders. Updates automatically.
        </p>
      </header>
      <BaristaHistory
        initialOrders={initialOrders}
        initiallyOffline={loadFailed}
      />
    </main>
  );
}
