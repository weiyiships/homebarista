"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { type Drink } from "@/lib/domain/menu";
import { DrinkGrid } from "@/components/menu/DrinkGrid";
import { CustomizationDrawer } from "@/components/menu/CustomizationDrawer";
import { useMenuPolling } from "@/components/menu/useMenuPolling";

interface MenuClientProps {
  drinks: Drink[];
  /** Milk labels the barista turned off when the page was rendered. */
  unavailableMilks: string[];
  /** Signed-in customer, or null for guests (US-11). */
  customer?: { name: string } | null;
}

const accountLink =
  "inline-flex min-h-11 items-center rounded-[6px] px-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none";

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
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <nav
        aria-label="Account"
        className="mb-4 flex flex-wrap items-center justify-end gap-1"
      >
        {customer ? (
          <>
            <span className="mr-auto text-sm text-[var(--muted-foreground)]">
              Signed in as {customer.name}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className={accountLink}>
              Log in
            </Link>
            <Link href="/signup" className={accountLink}>
              Create an account
            </Link>
          </>
        )}
      </nav>
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
        defaultGuestName={customer?.name ?? ""}
      />
    </main>
  );
}
