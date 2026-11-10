import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";
import { fromMenuDrinkDto, toMenuResponse } from "@/lib/domain/availability";
import { type Drink } from "@/lib/domain/menu";
import { MenuClient } from "./MenuClient";

// Availability changes at any time (FR-5), so never serve a cached menu.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Static fallback seed data (used when DB is unavailable during development)
// ---------------------------------------------------------------------------

const STATIC_DRINKS: Drink[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Espresso",
    available: true,
    takesMilk: false,
    sizeType: "shots",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Americano",
    available: true,
    takesMilk: false,
    sizeType: "shots",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Latte",
    available: true,
    takesMilk: true,
    sizeType: "size",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Cappuccino",
    available: true,
    takesMilk: true,
    sizeType: "size",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Flat White",
    available: true,
    takesMilk: true,
    sizeType: "size",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Mocha",
    available: true,
    takesMilk: true,
    sizeType: "size",
  },
];

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

/**
 * /menu — Server Component.
 *
 * Fetches every menu item (unavailable ones render disabled) and the milks
 * the barista turned off. Falls back to static seed data if the DB is
 * unavailable (e.g. dev without DATABASE_URL set).
 */
export default async function MenuPage() {
  let drinks: Drink[] = STATIC_DRINKS;
  let unavailableMilks: string[] = [];

  try {
    const [rows, milks] = await Promise.all([
      listMenuItems(),
      listMilkOptions(),
    ]);
    if (rows.length > 0) {
      const menu = toMenuResponse(rows, milks);
      drinks = menu.drinks.map(fromMenuDrinkDto);
      unavailableMilks = menu.unavailable_milks;
    }
  } catch {
    drinks = STATIC_DRINKS;
  }

  return <MenuClient drinks={drinks} unavailableMilks={unavailableMilks} />;
}
