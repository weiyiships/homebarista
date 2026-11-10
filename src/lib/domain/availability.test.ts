import { describe, expect, it } from "vitest";
import {
  checkOrderAvailability,
  toAvailabilityResponse,
  toMenuResponse,
  unavailableMilkLabels,
} from "./availability";

const drinkRow = (
  name: string,
  overrides: Partial<{
    id: string;
    available: boolean;
    takesMilk: boolean;
    sizeType: "size" | "shots";
  }> = {},
) => ({
  id: `id-${name}`,
  name,
  available: true,
  takesMilk: true,
  sizeType: "size" as const,
  ...overrides,
});

const milkRow = (label: string, available = true) => ({
  id: `id-${label}`,
  label,
  available,
});

describe("toAvailabilityResponse", () => {
  it("lists drinks and milks in menu order with their availability", () => {
    const result = toAvailabilityResponse(
      [
        drinkRow("Mocha"),
        drinkRow("Espresso", { available: false }),
        drinkRow("Latte"),
      ],
      [milkRow("Skim"), milkRow("Whole"), milkRow("Oat", false)],
    );

    expect(result).toEqual({
      drinks: [
        { id: "id-Espresso", label: "Espresso", available: false },
        { id: "id-Latte", label: "Latte", available: true },
        { id: "id-Mocha", label: "Mocha", available: true },
      ],
      milks: [
        { id: "id-Whole", label: "Whole", available: true },
        { id: "id-Oat", label: "Oat", available: false },
        { id: "id-Skim", label: "Skim", available: true },
      ],
    });
  });

  it("places items outside the standard menu last, alphabetically", () => {
    const result = toAvailabilityResponse(
      [drinkRow("Zebra Brew"), drinkRow("Cortado"), drinkRow("Americano")],
      [],
    );

    expect(result.drinks.map((d) => d.label)).toEqual([
      "Americano",
      "Cortado",
      "Zebra Brew",
    ]);
  });
});

describe("unavailableMilkLabels", () => {
  it("returns only the labels of milks that are turned off", () => {
    expect(
      unavailableMilkLabels([
        milkRow("Whole"),
        milkRow("Oat", false),
        milkRow("Almond", false),
      ]),
    ).toEqual(["Oat", "Almond"]);
  });

  it("returns an empty list when every milk is available", () => {
    expect(unavailableMilkLabels([milkRow("Whole")])).toEqual([]);
  });
});

describe("toMenuResponse", () => {
  it("includes unavailable drinks so the menu can show them disabled", () => {
    const result = toMenuResponse(
      [
        drinkRow("Latte", { available: false }),
        drinkRow("Espresso", { takesMilk: false, sizeType: "shots" }),
      ],
      [milkRow("Oat", false), milkRow("Whole")],
    );

    expect(result).toEqual({
      drinks: [
        {
          id: "id-Espresso",
          name: "Espresso",
          available: true,
          takes_milk: false,
          size_type: "shots",
        },
        {
          id: "id-Latte",
          name: "Latte",
          available: false,
          takes_milk: true,
          size_type: "size",
        },
      ],
      unavailable_milks: ["Oat"],
    });
  });
});

describe("checkOrderAvailability", () => {
  const milks = [milkRow("Whole"), milkRow("Oat", false)];

  it("accepts an available drink with an available milk", () => {
    expect(
      checkOrderAvailability(drinkRow("Latte"), { milk: "Whole" }, milks),
    ).toEqual({ ok: true });
  });

  it("accepts an available drink ordered without milk", () => {
    expect(
      checkOrderAvailability(
        drinkRow("Espresso", { takesMilk: false }),
        { temp: "Hot", sizing: "Double" },
        milks,
      ),
    ).toEqual({ ok: true });
  });

  it("rejects a drink that does not exist", () => {
    expect(checkOrderAvailability(null, {}, milks)).toEqual({
      ok: false,
      reason: "drink_not_found",
      message: "That drink is not on the menu.",
    });
  });

  it("rejects a drink the barista turned off", () => {
    expect(
      checkOrderAvailability(
        drinkRow("Mocha", { available: false }),
        { milk: "Whole" },
        milks,
      ),
    ).toEqual({
      ok: false,
      reason: "drink_unavailable",
      message: "Mocha is no longer available. Please choose another drink.",
    });
  });

  it("rejects a milk the barista turned off", () => {
    expect(
      checkOrderAvailability(drinkRow("Latte"), { milk: "Oat" }, milks),
    ).toEqual({
      ok: false,
      reason: "milk_unavailable",
      message: "Oat milk is no longer available. Please choose another milk.",
    });
  });

  it("rejects a milk that is not on the menu", () => {
    expect(
      checkOrderAvailability(drinkRow("Latte"), { milk: "Goat" }, milks),
    ).toMatchObject({ ok: false, reason: "milk_unavailable" });
  });

  it("rejects a milk value that is not a label", () => {
    expect(
      checkOrderAvailability(drinkRow("Latte"), { milk: 42 }, milks),
    ).toEqual({
      ok: false,
      reason: "milk_unavailable",
      message: "That milk is not on the menu.",
    });
  });
});
