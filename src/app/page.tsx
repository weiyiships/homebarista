import Link from "next/link";
import { Coffee, User, ClipboardList } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
      <div className="space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-md">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)]">Home Barista</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-xs mx-auto">
          Order freshly crafted coffee from your phone or run the live barista queue.
        </p>
      </div>

      <div className="w-full space-y-3 pt-4">
        <Link
          href="/menu"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow hover:opacity-95 transition min-h-[44px]"
        >
          <Coffee className="w-5 h-5" />
          <span>Order Coffee</span>
        </Link>

        <Link
          href="/barista/queue"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] font-medium hover:bg-opacity-80 transition min-h-[44px]"
        >
          <ClipboardList className="w-5 h-5 text-[var(--muted-foreground)]" />
          <span>Barista Queue</span>
        </Link>
      </div>

      <div className="pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
        >
          <User className="w-3.5 h-3.5" />
          <span>Customer Login</span>
        </Link>
      </div>
    </main>
  );
}
