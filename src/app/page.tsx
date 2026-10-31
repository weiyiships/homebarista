import Link from "next/link";
import { Coffee, User, ClipboardList } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md">
          <Coffee className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)]">
          Home Barista
        </h1>
        <p className="mx-auto max-w-xs text-sm text-[var(--muted-foreground)]">
          Order freshly crafted coffee from your phone or run the live barista
          queue.
        </p>
      </div>

      <div className="w-full space-y-3 pt-4">
        <Link
          href="/menu"
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 font-semibold text-[var(--primary-foreground)] shadow transition hover:opacity-95"
        >
          <Coffee className="h-5 w-5" />
          <span>Order Coffee</span>
        </Link>

        <Link
          href="/barista/queue"
          className="hover:bg-opacity-80 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-6 py-3.5 font-medium text-[var(--foreground)] transition"
        >
          <ClipboardList className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span>Barista Queue</span>
        </Link>
      </div>

      <div className="pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
        >
          <User className="h-3.5 w-3.5" />
          <span>Customer Login</span>
        </Link>
      </div>
    </main>
  );
}
