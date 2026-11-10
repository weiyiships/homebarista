import { execFileSync } from "node:child_process";
import postgres from "postgres";

const DRINKS = [
  { name: "Espresso", takesMilk: false, sizeType: "shots" },
  { name: "Americano", takesMilk: false, sizeType: "shots" },
  { name: "Latte", takesMilk: true, sizeType: "size" },
  { name: "Cappuccino", takesMilk: true, sizeType: "size" },
  { name: "Flat White", takesMilk: true, sizeType: "size" },
  { name: "Mocha", takesMilk: true, sizeType: "size" },
] as const;

const OPTIONS = [
  ["temp", "Hot"],
  ["temp", "Iced"],
  ["size", "Small"],
  ["size", "Medium"],
  ["size", "Large"],
  ["shots", "Single"],
  ["shots", "Double"],
  ["milk", "Whole"],
  ["milk", "Oat"],
  ["milk", "Almond"],
  ["milk", "Skim"],
] as const;

/** Applies the Drizzle schema to the E2E database. */
export function pushSchema(databaseUrl: string): void {
  execFileSync("npx", ["drizzle-kit", "push", "--force"], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });
}

/** Empties every table and seeds the PRD §7 menu. Never point at real data. */
export async function resetDatabase(databaseUrl: string): Promise<void> {
  const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    await sql`truncate order_items, orders, customers, options, menu_items restart identity cascade`;
    for (const drink of DRINKS) {
      await sql`
        insert into menu_items (name, available, takes_milk, size_type)
        values (${drink.name}, true, ${drink.takesMilk}, ${drink.sizeType})
      `;
    }
    for (const [type, label] of OPTIONS) {
      await sql`insert into options (type, label, available) values (${type}, ${label}, true)`;
    }
  } finally {
    await sql.end();
  }
}
