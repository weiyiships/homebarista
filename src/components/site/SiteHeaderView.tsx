"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";
import { PAGE_WIDE } from "./layout";

export interface SiteHeaderViewProps {
  /** Signed-in customer, or null for guests. */
  customer: { name: string } | null;
  /** Overrides the router path (tests). */
  currentPath?: string;
}

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

const navLink = cn(
  "inline-flex min-h-11 items-center rounded-[6px] px-3 text-sm font-medium whitespace-nowrap text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
  focusRing,
);

const accountLink = cn(
  "inline-flex min-h-11 items-center rounded-[6px] px-2.5 text-sm font-medium whitespace-nowrap text-[var(--foreground)] hover:bg-[var(--muted)]",
  focusRing,
);

function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

/**
 * Site-wide header (#42): brand, main navigation, and account actions. On
 * phones the main navigation drops to a second row so every link stays visible.
 */
export function SiteHeaderView({ customer, currentPath }: SiteHeaderViewProps) {
  const pathname = usePathname();
  const path = currentPath ?? pathname ?? "/";
  const links = [
    { href: "/menu", label: "Menu" },
    ...(customer ? [{ href: "/my-orders", label: "My orders" }] : []),
    { href: "/barista", label: "Barista" },
  ];

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div
        className={cn(
          PAGE_WIDE,
          "flex flex-wrap items-center gap-x-4 py-1.5 md:flex-nowrap",
        )}
      >
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[6px] pr-2 text-base font-bold tracking-tight whitespace-nowrap text-[var(--foreground)]",
            focusRing,
          )}
        >
          <Coffee className="h-6 w-6" aria-hidden="true" />
          Home Barista
        </Link>

        <nav
          aria-label="Main"
          className="order-3 -mx-3 flex w-full items-center gap-1 border-t border-[var(--border)] md:order-none md:mx-0 md:w-auto md:border-0"
        >
          {links.map(({ href, label }) => {
            const current = isCurrent(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  navLink,
                  current &&
                    "text-[var(--foreground)] underline decoration-2 underline-offset-8",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <nav aria-label="Account" className="ml-auto flex items-center gap-1">
          {customer ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/login" className={accountLink}>
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  accountLink,
                  "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)] hover:opacity-90",
                )}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
