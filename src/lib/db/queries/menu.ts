import { eq } from "drizzle-orm";
import { db } from "../index";
import { menuItems, type MenuItem } from "../schema";

/**
 * Fetches all menu items where `available = true`.
 *
 * Returns a typed array of MenuItem rows.
 */
export async function getAvailableMenuItems(): Promise<MenuItem[]> {
  return db.select().from(menuItems).where(eq(menuItems.available, true));
}
