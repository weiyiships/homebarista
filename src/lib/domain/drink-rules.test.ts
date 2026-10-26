import { describe, expect, it } from "vitest";
import {
  STANDARD_DRINKS,
  SHOT_OPTIONS,
  SIZE_OPTIONS,
  MILK_OPTIONS,
  TEMPERATURE_OPTIONS,
  getDrinkById,
  isEspresso,
  getValidSizeOrShotOptions,
  getDefaultCustomization,
  canDrinkTakeMilk,
  type DrinkId,
} from "./drink-rules";

describe("FR-1 Drink Rules and Options (Issue #3)", () => {
  it("defines the standard 6 drinks required by PRD FR-1", () => {
    const drinkNames = STANDARD_DRINKS.map((d) => d.name);
    expect(drinkNames).toEqual([
      "Espresso",
      "Americano",
      "Latte",
      "Cappuccino",
      "Flat White",
      "Mocha",
    ]);
  });

  it("identifies Espresso as shots-based and all others as size-based", () => {
    const espresso = getDrinkById("espresso");
    expect(espresso).toBeDefined();
    expect(espresso?.sizeType).toBe("shots");
    expect(isEspresso("espresso")).toBe(true);

    const nonEspressoDrinks: DrinkId[] = [
      "americano",
      "latte",
      "cappuccino",
      "flat-white",
      "mocha",
    ];

    for (const id of nonEspressoDrinks) {
      const drink = getDrinkById(id);
      expect(drink?.sizeType).toBe("sizes");
      expect(isEspresso(id)).toBe(false);
    }
  });

  it("returns Single and Double shot options for Espresso only", () => {
    const espressoOptions = getValidSizeOrShotOptions("espresso");
    expect(espressoOptions).toEqual(SHOT_OPTIONS);
    expect(SHOT_OPTIONS.map((o) => o.value)).toEqual(["single", "double"]);
  });

  it("returns Small, Medium, Large size options for non-espresso drinks", () => {
    const nonEspressoDrinks: DrinkId[] = [
      "americano",
      "latte",
      "cappuccino",
      "flat-white",
      "mocha",
    ];

    for (const id of nonEspressoDrinks) {
      const options = getValidSizeOrShotOptions(id);
      expect(options).toEqual(SIZE_OPTIONS);
    }
    expect(SIZE_OPTIONS.map((o) => o.value)).toEqual(["small", "medium", "large"]);
  });

  it("permits milk only for Latte, Cappuccino, Flat White, and Mocha", () => {
    expect(canDrinkTakeMilk("espresso")).toBe(false);
    expect(canDrinkTakeMilk("americano")).toBe(false);
    expect(canDrinkTakeMilk("latte")).toBe(true);
    expect(canDrinkTakeMilk("cappuccino")).toBe(true);
    expect(canDrinkTakeMilk("flat-white")).toBe(true);
    expect(canDrinkTakeMilk("mocha")).toBe(true);

    expect(MILK_OPTIONS.map((m) => m.value)).toEqual(["whole", "oat", "almond", "skim"]);
  });

  it("provides sensible defaults: medium, whole milk, hot, single shot", () => {
    const espresso = getDrinkById("espresso")!;
    expect(getDefaultCustomization(espresso)).toEqual({
      shot: "single",
      temperature: "hot",
    });

    const latte = getDrinkById("latte")!;
    expect(getDefaultCustomization(latte)).toEqual({
      size: "medium",
      milk: "whole",
      temperature: "hot",
    });

    const americano = getDrinkById("americano")!;
    expect(getDefaultCustomization(americano)).toEqual({
      size: "medium",
      temperature: "hot",
    });
  });

  it("includes hot and iced temperature options for all drinks", () => {
    expect(TEMPERATURE_OPTIONS.map((t) => t.value)).toEqual(["hot", "iced"]);
  });
});
