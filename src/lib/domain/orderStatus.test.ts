import { describe, expect, it } from "vitest";
import {
  ACTIVE_ORDER_STATUSES,
  filterActiveOrders,
  isActiveStatus,
  nextActionLabel,
  nextStatus,
  resolveStatusTransition,
} from "./orderStatus";

describe("order status state machine", () => {
  describe("nextStatus", () => {
    it.each([
      ["received", "brewing"],
      ["brewing", "ready"],
      ["ready", "picked_up"],
    ] as const)("advances %s to %s", (from, to) => {
      expect(nextStatus(from)).toBe(to);
    });

    it.each(["picked_up", "cancelled"] as const)(
      "returns null for terminal status %s",
      (status) => {
        expect(nextStatus(status)).toBeNull();
      },
    );
  });

  describe("isActiveStatus", () => {
    it.each(["received", "brewing", "ready"] as const)(
      "treats %s as active",
      (status) => {
        expect(isActiveStatus(status)).toBe(true);
      },
    );

    it.each(["picked_up", "cancelled"] as const)(
      "treats %s as not active",
      (status) => {
        expect(isActiveStatus(status)).toBe(false);
      },
    );

    it("exposes the active statuses in workflow order", () => {
      expect(ACTIVE_ORDER_STATUSES).toEqual(["received", "brewing", "ready"]);
    });
  });

  describe("resolveStatusTransition", () => {
    it("advance moves an active order to its next status", () => {
      expect(resolveStatusTransition("received", "advance")).toEqual({
        ok: true,
        from: "received",
        to: "brewing",
      });
      expect(resolveStatusTransition("ready", "advance")).toEqual({
        ok: true,
        from: "ready",
        to: "picked_up",
      });
    });

    it.each(["received", "brewing", "ready"] as const)(
      "cancel moves %s to cancelled",
      (status) => {
        expect(resolveStatusTransition(status, "cancel")).toEqual({
          ok: true,
          from: status,
          to: "cancelled",
        });
      },
    );

    it.each([
      ["picked_up", "advance"],
      ["picked_up", "cancel"],
      ["cancelled", "advance"],
      ["cancelled", "cancel"],
    ] as const)("rejects %s -> %s", (status, action) => {
      const result = resolveStatusTransition(status, action);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/already (picked up|cancelled)/i);
      }
    });
  });

  describe("nextActionLabel", () => {
    it.each([
      ["received", "Start brewing"],
      ["brewing", "Mark ready"],
      ["ready", "Mark picked up"],
    ] as const)("labels the %s action as %s", (status, label) => {
      expect(nextActionLabel(status)).toBe(label);
    });

    it.each(["picked_up", "cancelled"] as const)(
      "returns null for terminal status %s",
      (status) => {
        expect(nextActionLabel(status)).toBeNull();
      },
    );
  });

  describe("filterActiveOrders", () => {
    it("removes picked up and cancelled orders and keeps order", () => {
      const orders = [
        { id: "a", status: "received" as const },
        { id: "b", status: "picked_up" as const },
        { id: "c", status: "brewing" as const },
        { id: "d", status: "cancelled" as const },
        { id: "e", status: "ready" as const },
      ];
      expect(filterActiveOrders(orders).map((o) => o.id)).toEqual([
        "a",
        "c",
        "e",
      ]);
    });
  });
});
