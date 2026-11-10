import Link from "next/link";
import { cn } from "@/lib/utils";
import { PAGE_WIDE } from "./layout";

const footerLink =
  "rounded-[6px] text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none";

/** Site-wide footer (#42). */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--muted)]">
      <div
        className={cn(
          PAGE_WIDE,
          "flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <p className="text-sm text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">
            Home Barista
          </span>{" "}
          · Coffee orders for small gatherings
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/menu" className={footerLink}>
                Menu
              </Link>
            </li>
            <li>
              <Link href="/signup" className={footerLink}>
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/barista" className={footerLink}>
                Barista queue
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
