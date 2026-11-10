import Link from "next/link";
import {
  History,
  ListOrdered,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BaristaTab = "queue" | "history" | "availability";

const TABS: {
  id: BaristaTab;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { id: "queue", label: "Queue", href: "/barista", icon: ListOrdered },
  { id: "history", label: "History", href: "/barista/history", icon: History },
  {
    id: "availability",
    label: "Availability",
    href: "/barista/availability",
    icon: SlidersHorizontal,
  },
];

/** Tabs between the live queue, order history (FR-6), and availability (FR-5). */
export function BaristaNav({ current }: { current: BaristaTab }) {
  return (
    <nav aria-label="Barista">
      <ul className="flex gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--muted)] p-1">
        {TABS.map(({ id, label, href, icon: Icon }) => {
          const selected = id === current;
          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none sm:px-4",
                  selected
                    ? "border border-[var(--border)] bg-[var(--background)] text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
