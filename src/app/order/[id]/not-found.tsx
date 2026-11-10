import Link from "next/link";
import { PAGE_STATUS } from "@/components/site/layout";
import { cn } from "@/lib/utils";

export default function OrderNotFound() {
  return (
    <main className={cn(PAGE_STATUS, "flex flex-col gap-4 py-12")}>
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Order not found
      </h1>
      <p className="text-[var(--muted-foreground)]">
        Check the link you were given, or place a new order.
      </p>
      <Link
        href="/menu"
        className="inline-flex min-h-11 items-center justify-center self-start rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to menu
      </Link>
    </main>
  );
}
