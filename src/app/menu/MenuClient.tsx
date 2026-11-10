"use client";

import { useState } from "react";
import { type Drink } from "@/lib/domain/menu";
import { DrinkGrid } from "@/components/menu/DrinkGrid";
import { CustomizationDrawer } from "@/components/menu/CustomizationDrawer";
import { useMenuPolling } from "@/components/menu/useMenuPolling";

interface MenuClientProps {
  drinks: Drink[];
  /** Milk labels the barista turned off when the page was rendered. */
  unavailableMilks: string[];
}

/**
 * Client shell for the menu page.
 * Keeps availability live (FR-5), tracks which drink (if any) is selected,
 * and hosts the CustomizationDrawer.
 */
export function MenuClient({ drinks, unavailableMilks }: MenuClientProps) {
  const menu = useMenuPolling({ drinks, unavailableMilks });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Look the drink up in the live menu so the open drawer sees toggles.
  const selectedDrink = menu.drinks.find((d) => d.id === selectedId) ?? null;

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <h1 className="mb-6 text-[36px] leading-tight font-bold text-[var(--foreground)]">
        Our Menu
      </h1>
      <DrinkGrid
        drinks={menu.drinks}
        onSelect={(drink) => setSelectedId(drink.id)}
      />
      <CustomizationDrawer
        drink={selectedDrink}
        isOpen={selectedDrink !== null}
        onClose={() => setSelectedId(null)}
        unavailableMilks={menu.unavailableMilks}
      />
    </main>
  );
}
