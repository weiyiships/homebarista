import { describe, it, expect } from "vitest";
import {
  STANDARD_DRINKS,
  SHOT_OPTIONS,
  SIZE_OPTIONS,
  getDrinkById,
  getSizeOrShotOptions,
  getDefaultSizeOrShot,
  isDrinkAvailable,
  type Drink,
} from "./drink-rules";

// US-1, US-2 (Issue #3, PRD FR-1)
describe("Drink domain rules (FR-1, Issue #3)", () => {
  it("includes all 6 standard drinks from FR-1 catalog", () => {
    const ids = STANDARD_DRINKS.map((d) => d.id);
    expect(ids).toEqual([
      "espresso",
      "americano",
      "latte",
      "cappuccino",
      "flat_white",
      "mocha",
    ]);
  });

  it("configures Espresso to use shots instead of size", () => {
    const espresso = getDrinkById("espresso");
    expect(espresso).toBeDefined();
    expect(espresso?.sizeType).toBe("shots");
    expect(espresso?.takesMilk).toBe(false);

    const options = getSizeOrShotOptions("espresso");
    expect(options).toEqual(SHOT_OPTIONS);
    expect(options.map((o) => o.id)).toEqual(["single", "double"]);
    expect(getDefaultSizeOrShot("espresso")).toBe("single");
  });

  it("configures Americano to use sizes and not take milk", () => {
    const americano = getDrinkById("americano");
    expect(americano).toBeDefined();
    expect(americano?.sizeType).toBe("size");
    expect(americano?.takesMilk).toBe(false);

    const options = getSizeOrShotOptions("americano");
    expect(options).toEqual(SIZE_OPTIONS);
    expect(options.map((o) => o.id)).toEqual(["small", "medium", "large"]);
    expect(getDefaultSizeOrShot("americano")).toBe("medium");
  });

  it.each(["latte", "cappuccino", "flat_white", "mocha"] as const)(
    "configures %s to use sizes and take milk",
    (drinkId) => {
      const drink = getDrinkById(drinkId);
      expect(drink).toBeDefined();
      expect(drink?.sizeType).toBe("size");
      expect(drink?.takesMilk).toBe(true);

      const options = getSizeOrShotOptions(drinkId);
      expect(options).toEqual(SIZE_OPTIONS);
      expect(getDefaultSizeOrShot(drinkId)).toBe("medium");
    }
  );

  it("evaluates drink availability correctly", () => {
    const availableDrink: Drink = {
      id: "latte",
      name: "Latte",
      description: "Rich espresso with steamed milk and light foam",
      sizeType: "size",
      takesMilk: true,
      available: true,
    };
    const unavailableDrink: Drink = {
      ...availableDrink,
      available: false,
    };

    expect(isDrinkAvailable(availableDrink)).toBe(true);
    expect(isDrinkAvailable(unavailableDrink)).toBe(false);
  });
});
