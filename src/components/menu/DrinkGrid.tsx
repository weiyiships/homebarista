"use client";

import { type Drink } from "@/lib/domain/menu";
import { DrinkCard } from "./DrinkCard";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DrinkGridProps {
  drinks: Drink[];
  onSelect: (drink: Drink) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DrinkGrid — responsive grid of DrinkCards.
 *
 * Layout: horizontal cards in a 3 / 2 / 1 column grid (DESIGN.md, #42).
 * Uses CSS custom properties from globals.css — no hard-coded hex.
 */
export function DrinkGrid({ drinks, onSelect }: DrinkGridProps) {
  if (drinks.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        No drinks available right now. Check back soon!
      </p>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Drink menu"
    >
      {drinks.map((drink) => (
        <li key={drink.id}>
          <DrinkCard drink={drink} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
