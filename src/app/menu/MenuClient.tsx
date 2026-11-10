"use client";

import { useState } from "react";
import Link from "next/link";
import { Coffee, MapPin } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
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

const accountLink =
  "inline-flex min-h-11 items-center rounded-[6px] px-2.5 text-sm font-medium whitespace-nowrap text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none";

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
    <>
      <header className="-mx-4 -mt-4 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--background)] px-4 py-2">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[6px] pr-2 text-base font-bold tracking-tight whitespace-nowrap text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
        >
          <Coffee className="h-6 w-6" aria-hidden="true" />
          Home Barista
        </Link>
        <nav aria-label="Account" className="flex items-center gap-1">
          {customer ? (
            <>
              <Link href="/my-orders" className={accountLink}>
                My orders
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={accountLink}>
                Log in
              </Link>
              <Link href="/signup" className={accountLink}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-col gap-6 pb-8">
        <section
          aria-labelledby="menu-title"
          data-testid="menu-hero"
          className="-mx-4 flex flex-col gap-3 bg-[var(--muted)] px-4 pt-5 pb-4"
        >
          <div
            className="flex items-end justify-between gap-2 text-[var(--foreground)]"
            aria-hidden="true"
          >
            {HERO_DRINKS.map((name) => (
              <DrinkIllustration key={name} name={name} className="h-14 w-14" />
            ))}
          </div>
          <div>
            <h1
              id="menu-title"
              className="text-4xl leading-tight font-bold tracking-tight text-[var(--foreground)]"
            >
              Our Menu
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Ordering open · pickup at the bar
            </p>
            {customer && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Signed in as {customer.name}
              </p>
            )}
          </div>
        </section>

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
    </>
  );
}
