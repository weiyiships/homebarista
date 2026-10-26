/**
 * Domain rules and types for coffee drinks and customization options.
 * Pure business logic without side-effects or I/O (AGENTS.md Section 1.3, PRD FR-1).
 */

export type DrinkId =
  | "espresso"
  | "americano"
  | "latte"
  | "cappuccino"
  | "flat-white"
  | "mocha";

export type SizeOption = "small" | "medium" | "large";
export type ShotOption = "single" | "double";
export type MilkOption = "whole" | "oat" | "almond" | "skim";
export type TemperatureOption = "hot" | "iced";

export interface OptionItem<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface MenuItemDefinition {
  readonly id: DrinkId;
  readonly name: string;
  readonly description: string;
  readonly sizeType: "shots" | "sizes";
  readonly takesMilk: boolean;
  readonly defaultSizeOrShot: ShotOption | SizeOption;
  readonly available: boolean;
}

export interface DrinkCustomization {
  readonly size?: SizeOption;
  readonly shot?: ShotOption;
  readonly milk?: MilkOption;
  readonly temperature: TemperatureOption;
}

/**
 * Standard drinks defined by PRD FR-1 and Issue #3.
 */
export const STANDARD_DRINKS: readonly MenuItemDefinition[] = [
  {
    id: "espresso",
    name: "Espresso",
    description: "Rich and concentrated shot of espresso with crema.",
    // Espresso uses shots instead of size (PRD FR-1, #3)
    sizeType: "shots",
    takesMilk: false,
    defaultSizeOrShot: "single",
    available: true,
  },
  {
    id: "americano",
    name: "Americano",
    description: "Espresso diluted with hot water for a clean coffee flavor.",
    sizeType: "sizes",
    takesMilk: false,
    defaultSizeOrShot: "medium",
    available: true,
  },
  {
    id: "latte",
    name: "Latte",
    description: "Espresso with silky steamed milk and a light layer of microfoam.",
    sizeType: "sizes",
    takesMilk: true,
    defaultSizeOrShot: "medium",
    available: true,
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and airy thick foam.",
    sizeType: "sizes",
    takesMilk: true,
    defaultSizeOrShot: "medium",
    available: true,
  },
  {
    id: "flat-white",
    name: "Flat White",
    description: "Double shot of espresso topped with velvety microfoam.",
    sizeType: "sizes",
    takesMilk: true,
    defaultSizeOrShot: "medium",
    available: true,
  },
  {
    id: "mocha",
    name: "Mocha",
    description: "Espresso blended with rich chocolate and steamed milk.",
    sizeType: "sizes",
    takesMilk: true,
    defaultSizeOrShot: "medium",
    available: true,
  },
];

export const SHOT_OPTIONS: readonly OptionItem<ShotOption>[] = [
  { value: "single", label: "Single Shot" },
  { value: "double", label: "Double Shot" },
];

export const SIZE_OPTIONS: readonly OptionItem<SizeOption>[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const MILK_OPTIONS: readonly OptionItem<MilkOption>[] = [
  { value: "whole", label: "Whole Milk" },
  { value: "oat", label: "Oat Milk" },
  { value: "almond", label: "Almond Milk" },
  { value: "skim", label: "Skim Milk" },
];

export const TEMPERATURE_OPTIONS: readonly OptionItem<TemperatureOption>[] = [
  { value: "hot", label: "Hot" },
  { value: "iced", label: "Iced" },
];

/**
 * Checks whether the given drink ID represents Espresso.
 */
export function isEspresso(drinkId: DrinkId): boolean {
  return drinkId === "espresso";
}

/**
 * Retrieves a drink definition by its string ID.
 */
export function getDrinkById(id: string): MenuItemDefinition | undefined {
  return STANDARD_DRINKS.find((drink) => drink.id === id);
}

/**
 * Returns either shot options or size options depending on the drink.
 */
export function getValidSizeOrShotOptions(
  drinkId: DrinkId
): readonly OptionItem<ShotOption>[] | readonly OptionItem<SizeOption>[] {
  if (isEspresso(drinkId)) {
    return SHOT_OPTIONS;
  }
  return SIZE_OPTIONS;
}

/**
 * Checks if a drink takes milk (Latte, Cappuccino, Flat White, Mocha).
 */
export function canDrinkTakeMilk(drinkId: DrinkId): boolean {
  const drink = getDrinkById(drinkId);
  return drink ? drink.takesMilk : false;
}

/**
 * Returns the default customization for a drink per AGENTS.md Section 2.3:
 * medium, whole milk, hot, single shot.
 */
export function getDefaultCustomization(
  drink: MenuItemDefinition
): DrinkCustomization {
  const temperature: TemperatureOption = "hot";

  if (drink.sizeType === "shots") {
    return {
      shot: "single",
      temperature,
    };
  }

  if (drink.takesMilk) {
    return {
      size: "medium",
      milk: "whole",
      temperature,
    };
  }

  return {
    size: "medium",
    temperature,
  };
}
