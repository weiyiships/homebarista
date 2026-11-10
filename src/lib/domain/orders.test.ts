import { describe, expect, it } from "vitest";
import {
  generateOrderId,
  initialOrderStatus,
  validateOrderRequest,
} from "./orders";

describe("orders domain functions", () => {
  describe("generateOrderId", () => {
    it("generates an ID matching the HB-XXXX format", () => {
      const id = generateOrderId();
      expect(id).toMatch(/^HB-[2-9A-Z]{4}$/);
    });

    it("generates unique IDs across calls", () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateOrderId()));
      expect(ids.size).toBe(50);
    });
  });

  describe("initialOrderStatus", () => {
    it("returns 'received'", () => {
      expect(initialOrderStatus()).toBe("received");
    });
  });

  describe("validateOrderRequest", () => {
    const validUuid = "11111111-2222-4333-a444-555555555555";

    it("succeeds with valid request data", () => {
      const payload = {
        guest_name: "Alice",
        drink_id: validUuid,
        options: { temp: "Hot", sizing: "Single" },
      };

      const result = validateOrderRequest(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guest_name).toBe("Alice");
        expect(result.data.drink_id).toBe(validUuid);
        expect(result.data.options).toEqual({
          temp: "Hot",
          sizing: "Single",
        });
      }
    });

    it("defaults options to empty object if not provided", () => {
      const payload = {
        guest_name: "Bob",
        drink_id: validUuid,
      };

      const result = validateOrderRequest(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options).toEqual({});
      }
    });

    it("fails when guest_name is missing or empty", () => {
      const result = validateOrderRequest({
        guest_name: "   ",
        drink_id: validUuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toMatch(/guest name/i);
      }
    });

    it("fails when drink_id is not a valid UUID", () => {
      const result = validateOrderRequest({
        guest_name: "Charlie",
        drink_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.errors.some(
            (e) =>
              e.toLowerCase().includes("drink id") ||
              e.toLowerCase().includes("uuid"),
          ),
        ).toBe(true);
      }
    });
  });
});
