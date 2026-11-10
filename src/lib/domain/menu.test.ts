import { describe, expect, it } from "vitest";
import {
  filterAvailableDrinks,
  getDrinkOptions,
  isDrinkAvailable,
  validateCustomization,
  type Drink,
} from "./menu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDrink(overrides: Partial<Drink> = {}): Drink {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test",
    available: true,
    takesMilk: false,
    sizeType: "size",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getDrinkOptions
// ---------------------------------------------------------------------------

describe("getDrinkOptions", () => {
  it("all drinks get temperature options (Hot and Iced)", () => {
    const opts = getDrinkOptions(makeDrink());
    expect(opts.temp.map((o) => o.label)).toEqual(["Hot", "Iced"]);
    expect(opts.temp.every((o) => o.type === "temp")).toBe(true);
  });

  describe("Espresso (shots, no milk)", () => {
    const espresso = makeDrink({
      name: "Espresso",
      takesMilk: false,
      sizeType: "shots",
    });

    it("gets shot options not size options", () => {
      const opts = getDrinkOptions(espresso);
      expect(opts.sizing.every((o) => o.type === "shots")).toBe(true);
      expect(opts.sizing.map((o) => o.label)).toEqual(["Single", "Double"]);
    });

    it("gets no milk options", () => {
      const opts = getDrinkOptions(espresso);
      expect(opts.milk).toHaveLength(0);
    });
  });

  describe("Americano (shots, no milk)", () => {
    const americano = makeDrink({
      name: "Americano",
      takesMilk: false,
      sizeType: "shots",
    });

    it("gets shot options", () => {
      const opts = getDrinkOptions(americano);
      expect(opts.sizing.every((o) => o.type === "shots")).toBe(true);
    });

    it("gets no milk options", () => {
      const opts = getDrinkOptions(americano);
      expect(opts.milk).toHaveLength(0);
    });
  });

  describe("Latte (size, milk)", () => {
    const latte = makeDrink({
      name: "Latte",
      takesMilk: true,
      sizeType: "size",
    });

    it("gets size options not shot options", () => {
      const opts = getDrinkOptions(latte);
      expect(opts.sizing.every((o) => o.type === "size")).toBe(true);
      expect(opts.sizing.map((o) => o.label)).toEqual([
        "Small",
        "Medium",
        "Large",
      ]);
    });

    it("gets milk options", () => {
      const opts = getDrinkOptions(latte);
      expect(opts.milk).toHaveLength(4);
      expect(opts.milk.map((o) => o.label)).toEqual([
        "Whole",
        "Oat",
        "Almond",
        "Skim",
      ]);
      expect(opts.milk.every((o) => o.type === "milk")).toBe(true);
    });
  });

  describe("Cappuccino (size, milk)", () => {
    const cappuccino = makeDrink({
      name: "Cappuccino",
      takesMilk: true,
      sizeType: "size",
    });

    it("gets milk options", () => {
      const opts = getDrinkOptions(cappuccino);
      expect(opts.milk.length).toBeGreaterThan(0);
    });
  });

  describe("Flat White (size, milk)", () => {
    const flatWhite = makeDrink({
      name: "Flat White",
      takesMilk: true,
      sizeType: "size",
    });

    it("gets milk options", () => {
      const opts = getDrinkOptions(flatWhite);
      expect(opts.milk.length).toBeGreaterThan(0);
    });
  });

  describe("Mocha (size, milk)", () => {
    const mocha = makeDrink({
      name: "Mocha",
      takesMilk: true,
      sizeType: "size",
    });

    it("gets size options", () => {
      const opts = getDrinkOptions(mocha);
      expect(opts.sizing.every((o) => o.type === "size")).toBe(true);
    });

    it("gets milk options", () => {
      const opts = getDrinkOptions(mocha);
      expect(opts.milk.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// isDrinkAvailable
// ---------------------------------------------------------------------------

describe("isDrinkAvailable", () => {
  it("returns true for available drinks", () => {
    expect(isDrinkAvailable(makeDrink({ available: true }))).toBe(true);
  });

  it("returns false for unavailable drinks", () => {
    expect(isDrinkAvailable(makeDrink({ available: false }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// filterAvailableDrinks
// ---------------------------------------------------------------------------

describe("filterAvailableDrinks", () => {
  it("returns only available drinks", () => {
    const drinks = [
      makeDrink({ name: "A", available: true }),
      makeDrink({ name: "B", available: false }),
      makeDrink({ name: "C", available: true }),
    ];
    const result = filterAvailableDrinks(drinks);
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.name)).toEqual(["A", "C"]);
  });

  it("returns empty array when all drinks are unavailable", () => {
    expect(filterAvailableDrinks([makeDrink({ available: false })])).toEqual(
      [],
    );
  });

  it("returns all drinks when all are available", () => {
    const drinks = [makeDrink({ name: "A" }), makeDrink({ name: "B" })];
    expect(filterAvailableDrinks(drinks)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// validateCustomization
// ---------------------------------------------------------------------------

describe("validateCustomization", () => {
  describe("milk restrictions", () => {
    it("espresso with milk selection is invalid", () => {
      const espresso = makeDrink({
        name: "Espresso",
        takesMilk: false,
        sizeType: "shots",
      });
      const result = validateCustomization(espresso, {
        temp: "Hot",
        sizing: "Single",
        milk: "Oat",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("americano with milk selection is invalid", () => {
      const americano = makeDrink({
        name: "Americano",
        takesMilk: false,
        sizeType: "shots",
      });
      const result = validateCustomization(americano, {
        temp: "Iced",
        sizing: "Double",
        milk: "Whole",
      });
      expect(result.valid).toBe(false);
    });

    it("latte without milk selection is invalid", () => {
      const latte = makeDrink({
        name: "Latte",
        takesMilk: true,
        sizeType: "size",
      });
      const result = validateCustomization(latte, {
        temp: "Hot",
        sizing: "Medium",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.toLowerCase().includes("milk"))).toBe(
        true,
      );
    });
  });

  describe("temperature requirement", () => {
    it("missing temp is invalid", () => {
      const latte = makeDrink({
        name: "Latte",
        takesMilk: true,
        sizeType: "size",
      });
      const result = validateCustomization(latte, {
        sizing: "Medium",
        milk: "Oat",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.toLowerCase().includes("temp"))).toBe(
        true,
      );
    });
  });

  describe("sizing requirement", () => {
    it("missing sizing is invalid", () => {
      const espresso = makeDrink({
        name: "Espresso",
        takesMilk: false,
        sizeType: "shots",
      });
      const result = validateCustomization(espresso, { temp: "Hot" });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.toLowerCase().includes("shot"))).toBe(
        true,
      );
    });
  });

  describe("valid selections", () => {
    it("espresso with temp + shots and no milk is valid", () => {
      const espresso = makeDrink({
        name: "Espresso",
        takesMilk: false,
        sizeType: "shots",
      });
      const result = validateCustomization(espresso, {
        temp: "Hot",
        sizing: "Double",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("latte with temp + size + milk is valid", () => {
      const latte = makeDrink({
        name: "Latte",
        takesMilk: true,
        sizeType: "size",
      });
      const result = validateCustomization(latte, {
        temp: "Iced",
        sizing: "Large",
        milk: "Oat",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
