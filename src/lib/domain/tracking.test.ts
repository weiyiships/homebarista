import { describe, expect, it } from "vitest";
import {
  countOrdersAhead,
  formatQueuePosition,
  trackingSteps,
} from "./tracking";

const queue = [
  { id: "c", status: "received" as const, createdAt: "2026-11-10T12:03:00Z" },
  { id: "a", status: "brewing" as const, createdAt: "2026-11-10T12:00:00Z" },
  { id: "r", status: "ready" as const, createdAt: "2026-11-10T11:58:00Z" },
  { id: "b", status: "received" as const, createdAt: "2026-11-10T12:01:00Z" },
  { id: "d", status: "received" as const, createdAt: "2026-11-10T12:05:00Z" },
];

describe("countOrdersAhead", () => {
  it("counts earlier orders still waiting to be made", () => {
    // a (brewing) and b (received) arrived before c; r is already made.
    expect(countOrdersAhead("c", queue)).toBe(2);
  });

  it("returns 0 for the oldest waiting order", () => {
    expect(countOrdersAhead("b", queue.slice(1))).toBe(1);
    expect(countOrdersAhead("a", queue)).toBe(0);
  });

  it("ignores orders that arrived later", () => {
    expect(countOrdersAhead("d", queue)).toBe(3);
  });

  it("breaks arrival-time ties by id, matching the barista queue", () => {
    const tied = [
      { id: "y", status: "received" as const, createdAt: "2026-11-10T12:00Z" },
      { id: "x", status: "received" as const, createdAt: "2026-11-10T12:00Z" },
    ];
    expect(countOrdersAhead("x", tied)).toBe(0);
    expect(countOrdersAhead("y", tied)).toBe(1);
  });

  it("returns null when the order is not in the queue", () => {
    expect(countOrdersAhead("zzz", queue)).toBeNull();
  });
});

describe("formatQueuePosition", () => {
  it.each([
    [0, "You're next"],
    [1, "1 order ahead of you"],
    [2, "2 orders ahead of you"],
  ])("%i → %s", (ahead, label) => {
    expect(formatQueuePosition(ahead)).toBe(label);
  });
});

describe("trackingSteps", () => {
  it("marks earlier steps complete and the current one active", () => {
    expect(trackingSteps("brewing")).toEqual([
      { status: "received", label: "Received", state: "complete" },
      { status: "brewing", label: "Brewing", state: "current" },
      { status: "ready", label: "Ready", state: "upcoming" },
      { status: "picked_up", label: "Picked up", state: "upcoming" },
    ]);
  });

  it("marks every step complete once picked up", () => {
    expect(trackingSteps("picked_up").map((s) => s.state)).toEqual([
      "complete",
      "complete",
      "complete",
      "current",
    ]);
  });

  it("has no steps for a cancelled order", () => {
    expect(trackingSteps("cancelled")).toEqual([]);
  });
});
