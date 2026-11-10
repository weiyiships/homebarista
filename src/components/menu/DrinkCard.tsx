"use client";

import { describeDrink, type Drink } from "@/lib/domain/menu";
import { cn } from "@/lib/utils";
import { DrinkIllustration } from "./DrinkIllustration";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DrinkCard — client component.
 *
 * Shows a single drink with its name, description, and availability state.
 * Calls `onSelect` when the user clicks the card (the actual drawer is #4).
 */
export function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  const description = describeDrink(drink.name);
  const disabled = !drink.available;

  function handleClick() {
    if (!disabled) {
      onSelect(drink);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(drink);
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex min-h-32 items-stretch overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--background)] shadow-sm transition-shadow",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        <h2 className="text-base leading-snug font-semibold text-[var(--foreground)]">
          {drink.name}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {description}
        </p>
        {disabled && (
          <span className="mt-auto text-xs font-medium text-[var(--muted-foreground)]">
            Unavailable
          </span>
        )}
      </div>
      <div className="flex w-28 shrink-0 items-center justify-center bg-[var(--muted)]">
        <DrinkIllustration name={drink.name} className="h-20 w-20" />
      </div>
    </div>
  );
}
