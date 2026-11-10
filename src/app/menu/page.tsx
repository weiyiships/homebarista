import { listMenuItems } from "@/lib/db/queries/menu";
import { type Drink } from "@/lib/domain/menu";
import { MenuClient } from "./MenuClient";

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
 * Fetches available menu items from the DB.
 * Falls back to static seed data if the DB is unavailable (e.g. dev without
 * DATABASE_URL set).
 */
export default async function MenuPage() {
  let drinks: Drink[];

  try {
    const rows = await listMenuItems();
    drinks =
      rows.length > 0
        ? rows.map((r) => ({
            id: r.id,
            name: r.name,
            available: r.available,
            takesMilk: r.takesMilk,
            sizeType: r.sizeType,
          }))
        : STATIC_DRINKS;
  } catch {
    drinks = STATIC_DRINKS;
  }

  return <MenuClient drinks={drinks} />;
}
