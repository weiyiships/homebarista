/**
 * Pure availability rules (FR-5, US-6): what the barista can toggle, what the
 * guest menu shows, and whether an order may be placed.
 *
 * No DB imports. Works on plain objects matching the schema shape.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DrinkRow {
  id: string;
  name: string;
  available: boolean;
  takesMilk: boolean;
  sizeType: "size" | "shots";
}

export interface MilkRow {
  id: string;
  label: string;
  available: boolean;
}

export interface AvailabilityItem {
  id: string;
  label: string;
  available: boolean;
}

export interface AvailabilityView {
  drinks: AvailabilityItem[];
  milks: AvailabilityItem[];
}

export interface MenuDrinkDto {
  id: string;
  name: string;
  available: boolean;
  takes_milk: boolean;
  size_type: "size" | "shots";
}

export interface MenuView {
  drinks: MenuDrinkDto[];
  unavailable_milks: string[];
}

export type AvailabilityCheck =
  | { ok: true }
  | {
      ok: false;
      reason: "drink_not_found" | "drink_unavailable" | "milk_unavailable";
      message: string;
    };

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

/** Menu order from PRD FR-1; anything else sorts after, alphabetically. */
const DRINK_ORDER = [
  "Espresso",
  "Americano",
  "Latte",
  "Cappuccino",
  "Flat White",
  "Mocha",
] as const;

const MILK_ORDER = ["Whole", "Oat", "Almond", "Skim"] as const;

function sortByMenuOrder<T>(
  items: readonly T[],
  order: readonly string[],
  labelOf: (item: T) => string,
): T[] {
  const rank = (label: string) => {
    const index = order.indexOf(label);
    return index === -1 ? order.length : index;
  };
  return [...items].sort((a, b) => {
    const byRank = rank(labelOf(a)) - rank(labelOf(b));
    return byRank !== 0 ? byRank : labelOf(a).localeCompare(labelOf(b));
  });
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

/** Rows for the barista availability panel, in menu order. */
export function toAvailabilityResponse(
  drinks: readonly DrinkRow[],
  milks: readonly MilkRow[],
): AvailabilityView {
  return {
    drinks: sortByMenuOrder(drinks, DRINK_ORDER, (d) => d.name).map((d) => ({
      id: d.id,
      label: d.name,
      available: d.available,
    })),
    milks: sortByMenuOrder(milks, MILK_ORDER, (m) => m.label).map((m) => ({
      id: m.id,
      label: m.label,
      available: m.available,
    })),
  };
}

/** Labels of milks the barista has turned off. */
export function unavailableMilkLabels(milks: readonly MilkRow[]): string[] {
  return milks.filter((m) => !m.available).map((m) => m.label);
}

/**
 * Guest menu payload. Unavailable drinks stay in the list so the menu can
 * show them disabled instead of making them vanish mid-browse.
 */
export function toMenuResponse(
  drinks: readonly DrinkRow[],
  milks: readonly MilkRow[],
): MenuView {
  return {
    drinks: sortByMenuOrder(drinks, DRINK_ORDER, (d) => d.name).map((d) => ({
      id: d.id,
      name: d.name,
      available: d.available,
      takes_milk: d.takesMilk,
      size_type: d.sizeType,
    })),
    unavailable_milks: unavailableMilkLabels(milks),
  };
}

// ---------------------------------------------------------------------------
// Order guard
// ---------------------------------------------------------------------------

/**
 * Server-side guard for new orders: rejects drinks and milks that are turned
 * off, so a stale, already-open menu cannot order them (FR-5).
 */
export function checkOrderAvailability(
  drink: Pick<DrinkRow, "name" | "available"> | null,
  options: Readonly<Record<string, unknown>>,
  milks: readonly Pick<MilkRow, "label" | "available">[],
): AvailabilityCheck {
  if (!drink) {
    return {
      ok: false,
      reason: "drink_not_found",
      message: "That drink is not on the menu.",
    };
  }

  if (!drink.available) {
    return {
      ok: false,
      reason: "drink_unavailable",
      message: `${drink.name} is no longer available. Please choose another drink.`,
    };
  }

  const milk = options.milk;
  if (milk === undefined) return { ok: true };

  const match =
    typeof milk === "string" ? milks.find((m) => m.label === milk) : undefined;
  if (!match) {
    return {
      ok: false,
      reason: "milk_unavailable",
      message: "That milk is not on the menu.",
    };
  }
  if (!match.available) {
    return {
      ok: false,
      reason: "milk_unavailable",
      message: `${match.label} milk is no longer available. Please choose another milk.`,
    };
  }

  return { ok: true };
}
