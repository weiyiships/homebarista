import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomerOrderList } from "@/components/customer/CustomerOrderList";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";
import { listOrdersForCustomer } from "@/lib/db/queries/orders";
import { buildCustomerOrders } from "@/lib/domain/customerOrders";
import type { CustomerOrderDto } from "@/lib/schemas/customer";

export const dynamic = "force-dynamic";

/**
 * /my-orders — the signed-in customer's order history, newest first
 * (FR-8, US-12). Only orders linked to the session's customer are read.
 */
export default async function MyOrdersPage() {
  const cookieStore = await cookies();
  const customer = await verifyCustomerToken(
    cookieStore.get(CUSTOMER_COOKIE)?.value,
  );
  if (!customer) redirect("/login");

  let orders: CustomerOrderDto[] | null = null;
  try {
    orders = buildCustomerOrders(await listOrdersForCustomer(customer.id));
  } catch {
    orders = null;
  }

  return (
    <main className="flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-[var(--primary)] underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to menu
        </Link>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          My orders
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Everything you’ve ordered as {customer.name}, newest first.
        </p>
      </header>

      {orders ? (
        <CustomerOrderList orders={orders} />
      ) : (
        <p
          role="alert"
          className="rounded-[12px] border border-[var(--status-cancelled)] p-4 text-[var(--foreground)]"
        >
          We couldn’t load your orders right now. Refresh the page to try again.
        </p>
      )}
    </main>
  );
}
