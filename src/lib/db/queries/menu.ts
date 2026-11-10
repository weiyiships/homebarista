import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { menuItems, options, type MenuItem, type Option } from "../schema";

/** All menu items, available or not (the menu shows unavailable ones disabled). */
export async function listMenuItems(): Promise<MenuItem[]> {
  return db.select().from(menuItems);
}

/** A single menu item, or null when it does not exist. */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const [row] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, id))
    .limit(1);
  return row ?? null;
}

/** All milk options, available or not. */
export async function listMilkOptions(): Promise<Option[]> {
  return db.select().from(options).where(eq(options.type, "milk"));
}

/** Turns a drink on or off. Returns null when the drink does not exist. */
export async function setMenuItemAvailability(
  id: string,
  available: boolean,
): Promise<MenuItem | null> {
  const [row] = await db
    .update(menuItems)
    .set({ available })
    .where(eq(menuItems.id, id))
    .returning();
  return row ?? null;
}

/**
 * Turns a milk option on or off. Only rows of type `milk` match, so other
 * options (size, shots, temp) cannot be toggled through this path.
 */
export async function setMilkAvailability(
  id: string,
  available: boolean,
): Promise<Option | null> {
  const [row] = await db
    .update(options)
    .set({ available })
    .where(and(eq(options.id, id), eq(options.type, "milk")))
    .returning();
  return row ?? null;
}
