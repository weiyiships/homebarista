"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import type {
  AvailabilityItem,
  AvailabilityView,
} from "@/lib/domain/availability";
import {
  AvailabilityUpdateResponseSchema,
  type AvailabilityKind,
} from "@/lib/schemas/availability";
import { cn } from "@/lib/utils";

const LOGIN_REDIRECT = `/barista/login?next=${encodeURIComponent("/barista/availability")}`;

export interface BaristaAvailabilityProps {
  initial: AvailabilityView;
  /** The server could not read the menu; show an error instead of toggles. */
  loadFailed?: boolean;
}

type Lists = Record<"drinks" | "milks", AvailabilityItem[]>;

const LIST_FOR: Record<AvailabilityKind, keyof Lists> = {
  drink: "drinks",
  milk: "milks",
};

/**
 * Barista availability panel (FR-5, US-6): one switch per drink and milk.
 * Toggles apply optimistically and roll back if the server rejects them.
 */
export function BaristaAvailability({
  initial,
  loadFailed = false,
}: BaristaAvailabilityProps) {
  const router = useRouter();
  const [lists, setLists] = useState<Lists>({
    drinks: initial.drinks,
    milks: initial.milks,
  });
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(new Set<string>());

  function setItem(kind: AvailabilityKind, id: string, available: boolean) {
    const key = LIST_FOR[kind];
    setLists((current) => ({
      ...current,
      [key]: current[key].map((item) =>
        item.id === id ? { ...item, available } : item,
      ),
    }));
  }

  function markPending(id: string, isPending: boolean) {
    if (isPending) pendingRef.current.add(id);
    else pendingRef.current.delete(id);
    setPending(new Set(pendingRef.current));
  }

  async function toggle(kind: AvailabilityKind, item: AvailabilityItem) {
    if (pendingRef.current.has(item.id)) return;
    const next = !item.available;

    setError(null);
    markPending(item.id, true);
    setItem(kind, item.id, next);

    try {
      const response = await fetch("/api/barista/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id: item.id, available: next }),
      });
      if (response.status === 401) {
        router.replace(LOGIN_REDIRECT);
        return;
      }
      const parsed = AvailabilityUpdateResponseSchema.safeParse(
        response.ok ? await response.json() : null,
      );
      if (!parsed.success) throw new Error("Update rejected");
      setItem(kind, item.id, parsed.data.item.available);
    } catch {
      setItem(kind, item.id, item.available);
      setError(`Couldn't update ${item.label}. Please try again.`);
    } finally {
      markPending(item.id, false);
    }
  }

  if (loadFailed) {
    return (
      <p
        role="alert"
        className="flex items-center gap-2 rounded-[12px] border border-[var(--status-cancelled)] bg-[var(--background)] p-4 text-sm font-medium text-[var(--status-cancelled)]"
      >
        <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        Couldn&apos;t load the menu. Refresh the page to try again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[6px] border border-[var(--status-cancelled)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--status-cancelled)]"
        >
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      <AvailabilitySection
        title="Drinks"
        emptyText="No drinks on the menu yet."
        items={lists.drinks}
        pending={pending}
        onToggle={(item) => void toggle("drink", item)}
      />
      <AvailabilitySection
        title="Milks"
        emptyText="No milks on the menu yet."
        items={lists.milks}
        pending={pending}
        onToggle={(item) => void toggle("milk", item)}
      />
    </div>
  );
}

interface AvailabilitySectionProps {
  title: string;
  emptyText: string;
  items: AvailabilityItem[];
  pending: ReadonlySet<string>;
  onToggle: (item: AvailabilityItem) => void;
}

function AvailabilitySection({
  title,
  emptyText,
  items,
  pending,
  onToggle,
}: AvailabilitySectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2
        id={headingId}
        className="text-xl font-semibold text-[var(--foreground)]"
      >
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted-foreground)]">
          {emptyText}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--background)]">
          {items.map((item) => (
            <AvailabilityRow
              key={item.id}
              item={item}
              isPending={pending.has(item.id)}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface AvailabilityRowProps {
  item: AvailabilityItem;
  isPending: boolean;
  onToggle: (item: AvailabilityItem) => void;
}

function AvailabilityRow({ item, isPending, onToggle }: AvailabilityRowProps) {
  const labelId = useId();
  const stateId = useId();

  return (
    <li
      aria-labelledby={labelId}
      className="flex min-h-16 items-center justify-between gap-4 px-4 py-3"
    >
      <div className="flex min-w-0 flex-col">
        <span
          id={labelId}
          className={cn(
            "truncate text-base font-medium",
            item.available
              ? "text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] line-through decoration-1",
          )}
        >
          {item.label}
        </span>
        <span
          id={stateId}
          className={cn(
            "text-sm",
            item.available
              ? "text-[var(--muted-foreground)]"
              : "font-medium text-[var(--status-cancelled)]",
          )}
        >
          {item.available ? "On menu" : "Unavailable"}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={item.available}
        aria-labelledby={labelId}
        aria-describedby={stateId}
        aria-busy={isPending || undefined}
        disabled={isPending}
        onClick={() => onToggle(item)}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-[6px] border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60",
          item.available
            ? "border-[var(--primary)] bg-[var(--primary)]"
            : "border-[var(--border)] bg-[var(--muted)]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-6 w-6 rounded-[4px] shadow-sm transition-transform motion-reduce:transition-none",
            item.available
              ? "translate-x-7 bg-[var(--primary-foreground)]"
              : "translate-x-1 bg-[var(--muted-foreground)]",
          )}
        />
      </button>
    </li>
  );
}
