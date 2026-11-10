/**
 * Pure domain functions for the menu.
 *
 * No DB imports. Works on plain objects matching the schema shape.
 */

// ---------------------------------------------------------------------------
// Types (mirrors schema but dependency-free)
// ---------------------------------------------------------------------------

export interface Drink {
  id: string;
  name: string;
  available: boolean;
  takesMilk: boolean;
  sizeType: "size" | "shots";
}

export interface DrinkOption {
  type: "size" | "shots" | "milk" | "temp";
  label: string;
}

export interface DrinkOptions {
  temp: DrinkOption[];
  /** size OR shots — never both */
  sizing: DrinkOption[];
  /** empty array when drink does not take milk */
  milk: DrinkOption[];
}

// ---------------------------------------------------------------------------
// Static option sets (mirrors seed data — no DB calls here)
// ---------------------------------------------------------------------------

const TEMP_OPTIONS: DrinkOption[] = [
  { type: "temp", label: "Hot" },
  { type: "temp", label: "Iced" },
];

const SIZE_OPTIONS: DrinkOption[] = [
  { type: "size", label: "Small" },
  { type: "size", label: "Medium" },
  { type: "size", label: "Large" },
];

const SHOT_OPTIONS: DrinkOption[] = [
  { type: "shots", label: "Single" },
  { type: "shots", label: "Double" },
];

const MILK_OPTIONS: DrinkOption[] = [
  { type: "milk", label: "Whole" },
  { type: "milk", label: "Oat" },
  { type: "milk", label: "Almond" },
  { type: "milk", label: "Skim" },
];

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Returns the applicable option groups for a drink.
 *
 * - All drinks get temperature options.
 * - `sizeType === "size"` drinks get size options; "shots" drinks get shot options.
 * - Only drinks where `takesMilk === true` get milk options.
 */
export function getDrinkOptions(drink: Drink): DrinkOptions {
  return {
    temp: TEMP_OPTIONS,
    sizing: drink.sizeType === "size" ? SIZE_OPTIONS : SHOT_OPTIONS,
    milk: drink.takesMilk ? MILK_OPTIONS : [],
  };
}

/** Returns whether a drink is currently available. */
export function isDrinkAvailable(drink: Drink): boolean {
  return drink.available;
}

/** Filters an array of drinks to only the available ones. */
export function filterAvailableDrinks(drinks: Drink[]): Drink[] {
  return drinks.filter(isDrinkAvailable);
}

// ---------------------------------------------------------------------------
// Customization validation (added in issue #4 — defined here to keep domain pure)
// ---------------------------------------------------------------------------

export interface CustomizationSelection {
  temp?: string;
  sizing?: string;
  milk?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a customization selection against the drink's rules.
 *
 * Rules:
 * - temp is always required.
 * - sizing (size or shots) is always required.
 * - milk is required when `drink.takesMilk === true`.
 * - milk is forbidden when `drink.takesMilk === false`.
 */
export function validateCustomization(
  drink: Drink,
  selection: CustomizationSelection,
): ValidationResult {
  const errors: string[] = [];

  if (!selection.temp) {
    errors.push("Temperature selection is required.");
  }

  if (!selection.sizing) {
    const label = drink.sizeType === "size" ? "Size" : "Shot count";
    errors.push(`${label} selection is required.`);
  }

  if (drink.takesMilk && !selection.milk) {
    errors.push("Milk selection is required for this drink.");
  }

  if (!drink.takesMilk && selection.milk) {
    errors.push("This drink does not support a milk option.");
  }

  return { valid: errors.length === 0, errors };
}
