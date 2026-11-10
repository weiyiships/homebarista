import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./customers";

describe("isUniqueViolation", () => {
  it("detects a Postgres unique violation, directly or wrapped by Drizzle", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(
      isUniqueViolation(
        new Error("query failed", { cause: { code: "23505" } }),
      ),
    ).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(new Error("db down"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});
