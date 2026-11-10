"use client";

import { type Drink } from "@/lib/domain/menu";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Drink descriptions derived from name
// ---------------------------------------------------------------------------

const DESCRIPTIONS: Record<string, string> = {
  Espresso: "Concentrated, bold shot of coffee.",
  Americano: "Espresso diluted with hot water.",
  Latte: "Smooth espresso with steamed milk.",
  Cappuccino: "Equal parts espresso, steamed and foamed milk.",
  "Flat White": "Rich espresso with velvety microfoam.",
  Mocha: "Espresso, chocolate, and steamed milk.",
};

function getDescription(name: string): string {
  return DESCRIPTIONS[name] ?? "A delicious handcrafted coffee drink.";
}

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
  const description = getDescription(drink.name);
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
      aria-label={`${drink.name}${disabled ? " — unavailable" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex flex-col gap-2 rounded-[12px] border border-[var(--border)] bg-white p-6 transition-shadow",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none",
      )}
    >
      <h2 className="text-base leading-snug font-semibold text-[var(--foreground)]">
        {drink.name}
      </h2>

      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>

      {disabled && (
        <span className="mt-auto text-xs font-medium text-[var(--muted-foreground)]">
          Unavailable
        </span>
      )}
    </div>
  );
}
