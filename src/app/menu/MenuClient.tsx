"use client";

import { type Drink } from "@/lib/domain/menu";
import { DrinkGrid } from "@/components/menu/DrinkGrid";
import { CustomizationDrawer } from "@/components/menu/CustomizationDrawer";
import { useState } from "react";

interface MenuClientProps {
  drinks: Drink[];
}

/**
 * Client shell for the menu page.
 * Manages which drink (if any) is selected and hosts the CustomizationDrawer.
 */
export function MenuClient({ drinks }: MenuClientProps) {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <h1 className="mb-6 text-[36px] leading-tight font-bold text-[var(--foreground)]">
        Our Menu
      </h1>
      <DrinkGrid drinks={drinks} onSelect={setSelectedDrink} />
      <CustomizationDrawer
        drink={selectedDrink}
        isOpen={selectedDrink !== null}
        onClose={() => setSelectedDrink(null)}
      />
    </main>
  );
}
