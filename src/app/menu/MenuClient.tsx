"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { PAGE_WIDE } from "@/components/site/layout";
import { cn } from "@/lib/utils";
import { type Drink } from "@/lib/domain/menu";
import { DrinkGrid } from "@/components/menu/DrinkGrid";
import { CustomizationDrawer } from "@/components/menu/CustomizationDrawer";
import { useMenuPolling } from "@/components/menu/useMenuPolling";
import { DrinkIllustration } from "@/components/menu/DrinkIllustration";

const HERO_DRINKS = [
  "Espresso",
  "Latte",
  "Cappuccino",
  "Mocha",
  "Americano",
] as const;

interface MenuClientProps {
  drinks: Drink[];
  /** Milk labels the barista turned off when the page was rendered. */
  unavailableMilks: string[];
  /** Signed-in customer, or null for guests (US-11). */
  customer?: { name: string } | null;
}

/**
 * Client shell for the menu page.
 * Keeps availability live (FR-5), tracks which drink (if any) is selected,
 * and hosts the CustomizationDrawer.
 */
export function MenuClient({
  drinks,
  unavailableMilks,
  customer = null,
}: MenuClientProps) {
  const menu = useMenuPolling({ drinks, unavailableMilks });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Look the drink up in the live menu so the open drawer sees toggles.
  const selectedDrink = menu.drinks.find((d) => d.id === selectedId) ?? null;

  return (
    <main className="flex flex-col gap-8 pb-8">
      <section
        aria-labelledby="menu-title"
        data-testid="menu-hero"
        className="border-b border-[var(--border)] bg-[var(--muted)]"
      >
        <div
          className={cn(
            PAGE_WIDE,
            "flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12",
          )}
        >
          <div>
            <h1
              id="menu-title"
              className="text-4xl leading-tight font-bold tracking-tight text-[var(--foreground)] md:text-5xl"
            >
              Our Menu
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] md:text-base">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Ordering open · pickup at the bar
            </p>
            {customer && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Signed in as {customer.name}
              </p>
            )}
          </div>
          <div
            className="flex items-end justify-between gap-2 text-[var(--foreground)] md:justify-end md:gap-6"
            aria-hidden="true"
          >
            {HERO_DRINKS.map((name) => (
              <DrinkIllustration
                key={name}
                name={name}
                className="h-14 w-14 md:h-20 md:w-20"
              />
            ))}
          </div>
        </div>
      </section>

      <div className={PAGE_WIDE}>
        <DrinkGrid
          drinks={menu.drinks}
          onSelect={(drink) => setSelectedId(drink.id)}
        />
      </div>
      <CustomizationDrawer
        drink={selectedDrink}
        isOpen={selectedDrink !== null}
        onClose={() => setSelectedId(null)}
        unavailableMilks={menu.unavailableMilks}
        defaultGuestName={customer?.name ?? ""}
      />
    </main>
  );
}
