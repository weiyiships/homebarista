import { describe, expect, it } from "vitest";
import {
  FINISHED_ORDER_STATUSES,
  buildHistory,
  countHistory,
  formatClockTime,
  isFinishedStatus,
  shortOrderId,
  sortNewestFinishedFirst,
} from "./history";

describe("isFinishedStatus", () => {
  it("treats picked_up and cancelled as finished", () => {
    expect(FINISHED_ORDER_STATUSES).toEqual(["picked_up", "cancelled"]);
    expect(isFinishedStatus("picked_up")).toBe(true);
    expect(isFinishedStatus("cancelled")).toBe(true);
  });

  it("treats queue statuses as not finished", () => {
    expect(isFinishedStatus("received")).toBe(false);
    expect(isFinishedStatus("brewing")).toBe(false);
    expect(isFinishedStatus("ready")).toBe(false);
  });
});

describe("sortNewestFinishedFirst", () => {
  it("orders by finish time, newest first", () => {
    const orders = [
      {
        id: "a",
        createdAt: "2026-11-10T12:00:00.000Z",
        finishedAt: "2026-11-10T12:05:00.000Z",
      },
      {
        id: "c",
        createdAt: "2026-11-10T12:01:00.000Z",
        finishedAt: "2026-11-10T12:09:00.000Z",
      },
      {
        id: "b",
        createdAt: "2026-11-10T12:02:00.000Z",
        finishedAt: "2026-11-10T12:07:00.000Z",
      },
    ];

    expect(sortNewestFinishedFirst(orders).map((o) => o.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("breaks finish-time ties by newest order time", () => {
    const orders = [
      {
        id: "older",
        createdAt: "2026-11-10T12:00:00.000Z",
        finishedAt: "2026-11-10T12:05:00.000Z",
      },
      {
        id: "newer",
        createdAt: "2026-11-10T12:01:00.000Z",
        finishedAt: "2026-11-10T12:05:00.000Z",
      },
    ];

    expect(sortNewestFinishedFirst(orders).map((o) => o.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("accepts Date values and does not mutate the input", () => {
    const orders = [
      {
        id: "a",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        finishedAt: new Date("2026-11-10T12:01:00.000Z"),
      },
      {
        id: "b",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        finishedAt: new Date("2026-11-10T12:02:00.000Z"),
      },
    ];

    expect(sortNewestFinishedFirst(orders).map((o) => o.id)).toEqual([
      "b",
      "a",
    ]);
    expect(orders.map((o) => o.id)).toEqual(["a", "b"]);
  });
});

describe("countHistory", () => {
  it("counts total, picked up, and cancelled orders", () => {
    expect(
      countHistory([
        { status: "picked_up" },
        { status: "cancelled" },
        { status: "picked_up" },
      ]),
    ).toEqual({ total: 3, pickedUp: 2, cancelled: 1 });
  });

  it("returns zeros for an empty history", () => {
    expect(countHistory([])).toEqual({ total: 0, pickedUp: 0, cancelled: 0 });
  });
});

describe("shortOrderId", () => {
  it("shows the first six characters of the order ID in upper case", () => {
    expect(shortOrderId("1a2b3c4d-2222-4333-a444-555555555555")).toBe(
      "#1A2B3C",
    );
  });

  it("ignores dashes near the start of the ID", () => {
    expect(shortOrderId("abc-def-ghi")).toBe("#ABCDEF");
  });
});

describe("formatClockTime", () => {
  it("formats a timestamp as a short date and time", () => {
    expect(formatClockTime("2026-11-10T17:05:00.000Z", "UTC")).toBe(
      "Nov 10, 5:05 PM",
    );
  });

  it("respects the requested time zone", () => {
    expect(
      formatClockTime("2026-11-10T17:05:00.000Z", "America/New_York"),
    ).toBe("Nov 10, 12:05 PM");
  });
});

describe("buildHistory", () => {
  const base = {
    guestName: "Alice",
    drinkName: "Latte",
    optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
  };

  it("keeps finished orders, newest first, in the API shape", () => {
    expect(
      buildHistory([
        {
          ...base,
          id: "11111111-2222-4333-a444-555555555555",
          status: "picked_up",
          createdAt: new Date("2026-11-10T12:00:00.000Z"),
          finishedAt: new Date("2026-11-10T12:06:00.000Z"),
        },
        {
          ...base,
          id: "22222222-2222-4333-a444-555555555555",
          guestName: "Bob",
          drinkName: "Espresso",
          optionsJson: { temp: "Hot", sizing: "Double" },
          status: "cancelled",
          createdAt: new Date("2026-11-10T12:02:00.000Z"),
          finishedAt: new Date("2026-11-10T12:08:00.000Z"),
        },
        {
          ...base,
          id: "33333333-2222-4333-a444-555555555555",
          status: "brewing",
          createdAt: new Date("2026-11-10T12:03:00.000Z"),
          finishedAt: new Date("2026-11-10T12:09:00.000Z"),
        },
      ]),
    ).toEqual([
      {
        id: "22222222-2222-4333-a444-555555555555",
        guest_name: "Bob",
        drink_name: "Espresso",
        status: "cancelled",
        created_at: "2026-11-10T12:02:00.000Z",
        finished_at: "2026-11-10T12:08:00.000Z",
        options: { sizing: "Double", milk: null, temp: "Hot" },
      },
      {
        id: "11111111-2222-4333-a444-555555555555",
        guest_name: "Alice",
        drink_name: "Latte",
        status: "picked_up",
        created_at: "2026-11-10T12:00:00.000Z",
        finished_at: "2026-11-10T12:06:00.000Z",
        options: { sizing: "Large", milk: "Oat", temp: "Iced" },
      },
    ]);
  });

  it("uses a placeholder when the drink was removed", () => {
    const [entry] = buildHistory([
      {
        ...base,
        id: "11111111-2222-4333-a444-555555555555",
        drinkName: null,
        status: "picked_up",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        finishedAt: new Date("2026-11-10T12:06:00.000Z"),
      },
    ]);

    expect(entry.drink_name).toBe("Unknown drink");
  });
});
