// Domain rules for drinks catalog and customizations (PRD FR-1, #3)

export type DrinkId =
  | "espresso"
  | "americano"
  | "latte"
  | "cappuccino"
  | "flat_white"
  | "mocha";

export type SizeType = "shots" | "size";

export type ShotOptionId = "single" | "double";
export type SizeOptionId = "small" | "medium" | "large";

export interface ShotOption {
  id: ShotOptionId;
  label: string;
}

export interface SizeOption {
  id: SizeOptionId;
  label: string;
}

export interface Drink {
  id: DrinkId;
  name: string;
  description: string;
  sizeType: SizeType;
  takesMilk: boolean;
  available: boolean;
}

export const SHOT_OPTIONS: readonly ShotOption[] = [
  { id: "single", label: "Single Shot" },
  { id: "double", label: "Double Shot" },
] as const;

export const SIZE_OPTIONS: readonly SizeOption[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
] as const;

// Standard drink catalog as defined in PRD FR-1 (#3)
export const STANDARD_DRINKS: readonly Drink[] = [
  {
    id: "espresso",
    name: "Espresso",
    description: "Concentrated espresso shot with rich crema",
    // Espresso uses shots instead of size (PRD FR-1, #3)
    sizeType: "shots",
    takesMilk: false,
    available: true,
  },
  {
    id: "americano",
    name: "Americano",
    description: "Espresso diluted with hot water for a smooth brew",
    sizeType: "size",
    takesMilk: false,
    available: true,
  },
  {
    id: "latte",
    name: "Latte",
    description: "Espresso with steamed milk and a thin layer of microfoam",
    sizeType: "size",
    takesMilk: true,
    available: true,
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and dense foam",
    sizeType: "size",
    takesMilk: true,
    available: true,
  },
  {
    id: "flat_white",
    name: "Flat White",
    description: "Bold espresso blended with velvety steamed microfoam",
    sizeType: "size",
    takesMilk: true,
    available: true,
  },
  {
    id: "mocha",
    name: "Mocha",
    description: "Espresso combined with rich chocolate and steamed milk",
    sizeType: "size",
    takesMilk: true,
    available: true,
  },
] as const;

export function getDrinkById(id: string): Drink | undefined {
  return STANDARD_DRINKS.find((drink) => drink.id === id);
}

export function getSizeOrShotOptions(
  drinkId: DrinkId
): readonly (ShotOption | SizeOption)[] {
  const drink = getDrinkById(drinkId);
  if (!drink) return [];
  // Espresso uses shots; all other drinks use sizes (PRD FR-1, #3)
  return drink.sizeType === "shots" ? SHOT_OPTIONS : SIZE_OPTIONS;
}

export function getDefaultSizeOrShot(
  drinkId: DrinkId
): ShotOptionId | SizeOptionId {
  const drink = getDrinkById(drinkId);
  // Sensible defaults: single shot for espresso, medium for others (PRD FR-1, AGENTS.md 2.3, #3)
  if (drink?.sizeType === "shots") {
    return "single";
  }
  return "medium";
}

export function isDrinkAvailable(drink: Drink): boolean {
  return drink.available;
}
