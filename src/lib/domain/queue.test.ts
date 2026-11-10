import { describe, expect, it } from "vitest";
import {
  describeOrderOptions,
  formatElapsed,
  parseOrderOptions,
  sortOldestFirst,
} from "./queue";

describe("sortOldestFirst", () => {
  it("orders by arrival time, oldest first", () => {
    const orders = [
      { id: "c", createdAt: "2026-11-10T12:02:00.000Z" },
      { id: "a", createdAt: "2026-11-10T12:00:00.000Z" },
      { id: "b", createdAt: "2026-11-10T12:01:00.000Z" },
    ];

    expect(sortOldestFirst(orders).map((o) => o.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps a stable order for orders with the same arrival time", () => {
    const orders = [
      { id: "x", createdAt: "2026-11-10T12:00:00.000Z" },
      { id: "y", createdAt: "2026-11-10T12:00:00.000Z" },
    ];

    expect(sortOldestFirst(orders).map((o) => o.id)).toEqual(["x", "y"]);
  });

  it("does not mutate the input", () => {
    const orders = [
      { id: "b", createdAt: "2026-11-10T12:01:00.000Z" },
      { id: "a", createdAt: "2026-11-10T12:00:00.000Z" },
    ];

    sortOldestFirst(orders);

    expect(orders.map((o) => o.id)).toEqual(["b", "a"]);
  });

  it("accepts Date values", () => {
    const orders = [
      { id: "b", createdAt: new Date("2026-11-10T12:01:00.000Z") },
      { id: "a", createdAt: new Date("2026-11-10T12:00:00.000Z") },
    ];

    expect(sortOldestFirst(orders).map((o) => o.id)).toEqual(["a", "b"]);
  });
});

describe("formatElapsed", () => {
  const created = "2026-11-10T12:00:00.000Z";

  it("shows seconds under a minute", () => {
    expect(formatElapsed(created, new Date("2026-11-10T12:00:42.000Z"))).toBe(
      "42s",
    );
  });

  it("shows minutes and seconds under an hour", () => {
    expect(formatElapsed(created, new Date("2026-11-10T12:03:05.000Z"))).toBe(
      "3m 05s",
    );
  });

  it("shows hours and minutes past an hour", () => {
    expect(formatElapsed(created, new Date("2026-11-10T13:07:59.000Z"))).toBe(
      "1h 07m",
    );
  });

  it("clamps clock skew to 0s", () => {
    expect(formatElapsed(created, new Date("2026-11-10T11:59:50.000Z"))).toBe(
      "0s",
    );
  });
});

describe("parseOrderOptions", () => {
  it("reads sizing, milk, and temperature", () => {
    expect(
      parseOrderOptions({ temp: "Iced", sizing: "Large", milk: "Oat" }),
    ).toEqual({ sizing: "Large", milk: "Oat", temp: "Iced" });
  });

  it("leaves milk out for drinks without milk", () => {
    expect(parseOrderOptions({ temp: "Hot", sizing: "Double" })).toEqual({
      sizing: "Double",
      milk: null,
      temp: "Hot",
    });
  });

  it("ignores non-string or blank values", () => {
    expect(parseOrderOptions({ temp: 3, sizing: " ", milk: null })).toEqual({
      sizing: null,
      milk: null,
      temp: null,
    });
  });

  it("handles a missing or non-object payload", () => {
    const empty = { sizing: null, milk: null, temp: null };
    expect(parseOrderOptions(null)).toEqual(empty);
    expect(parseOrderOptions("Hot")).toEqual(empty);
    expect(parseOrderOptions(["Hot"])).toEqual(empty);
  });
});

describe("describeOrderOptions", () => {
  it("lists size or shots, milk, then temperature", () => {
    expect(
      describeOrderOptions({ sizing: "Large", milk: "Oat", temp: "Iced" }),
    ).toEqual(["Large", "Oat milk", "Iced"]);
  });

  it("skips missing options", () => {
    expect(
      describeOrderOptions({ sizing: "Double", milk: null, temp: "Hot" }),
    ).toEqual(["Double", "Hot"]);
  });
});
