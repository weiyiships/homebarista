/**
 * Seed data for local development and testing.
 *
 * Run with:  npx tsx src/lib/db/seed.ts
 *
 * Does NOT run automatically. Requires DATABASE_URL to be set.
 */

import { db } from "./index";
import { menuItems, options } from "./schema";

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------

const drinks = [
  { name: "Espresso", takesMilk: false, sizeType: "shots" as const },
  { name: "Americano", takesMilk: false, sizeType: "shots" as const },
  { name: "Latte", takesMilk: true, sizeType: "size" as const },
  { name: "Cappuccino", takesMilk: true, sizeType: "size" as const },
  { name: "Flat White", takesMilk: true, sizeType: "size" as const },
  { name: "Mocha", takesMilk: true, sizeType: "size" as const },
];

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const tempOptions = [
  { type: "temp" as const, label: "Hot" },
  { type: "temp" as const, label: "Iced" },
];

const sizeOptions = [
  { type: "size" as const, label: "Small" },
  { type: "size" as const, label: "Medium" },
  { type: "size" as const, label: "Large" },
];

const shotOptions = [
  { type: "shots" as const, label: "Single" },
  { type: "shots" as const, label: "Double" },
];

const milkOptions = [
  { type: "milk" as const, label: "Whole" },
  { type: "milk" as const, label: "Oat" },
  { type: "milk" as const, label: "Almond" },
  { type: "milk" as const, label: "Skim" },
];

const allOptions = [
  ...tempOptions,
  ...sizeOptions,
  ...shotOptions,
  ...milkOptions,
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
  await db.insert(menuItems).values(drinks).onConflictDoNothing();
  await db.insert(options).values(allOptions).onConflictDoNothing();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err: unknown) => {
    process.stderr.write(`Seed failed: ${String(err)}\n`);
    process.exit(1);
  });
