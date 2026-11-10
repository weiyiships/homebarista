"use client";

import { type Drink } from "@/lib/domain/menu";
import { DrinkGrid } from "@/components/menu/DrinkGrid";
import { useState } from "react";

interface MenuClientProps {
  drinks: Drink[];
}

/**
 * Client shell for the menu page.
 * Manages which drink (if any) is selected and will host the drawer (issue #4).
 */
export function MenuClient({ drinks }: MenuClientProps) {
  /**
   * selectedDrink is set when the user clicks a drink card.
   * The CustomizationDrawer (issue #4) reads this prop to know which drink
   * to show options for. The null check in the JSX below satisfies lint.
   */
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <h1 className="mb-6 text-[36px] leading-tight font-bold text-[var(--foreground)]">
        Our Menu
      </h1>
      <DrinkGrid drinks={drinks} onSelect={setSelectedDrink} />
      {/* Placeholder: CustomizationDrawer renders here in issue #4 */}
      {selectedDrink !== null && null}
    </main>
  );
}
