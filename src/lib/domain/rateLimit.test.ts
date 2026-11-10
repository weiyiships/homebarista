import { describe, expect, it } from "vitest";
import { evaluateRateLimit, pruneAttempts } from "./rateLimit";

const policy = { maxAttempts: 5, windowMs: 15 * 60 * 1000 };
const t0 = Date.parse("2026-11-10T12:00:00Z");
const min = 60 * 1000;

describe("pruneAttempts", () => {
  it("drops attempts older than the window", () => {
    expect(
      pruneAttempts([t0, t0 + 5 * min, t0 + 14 * min], t0 + 15 * min, policy),
    ).toEqual([t0 + 5 * min, t0 + 14 * min]);
  });
});

describe("evaluateRateLimit", () => {
  it("allows fewer than the max failures", () => {
    const four = [t0, t0 + 1, t0 + 2, t0 + 3];
    expect(evaluateRateLimit(four, t0 + min, policy)).toEqual({
      limited: false,
    });
  });

  it("blocks once the max failures happened inside the window", () => {
    const five = [t0, t0 + min, t0 + 2 * min, t0 + 3 * min, t0 + 4 * min];
    expect(evaluateRateLimit(five, t0 + 5 * min, policy)).toEqual({
      limited: true,
      retryAfterSeconds: 10 * 60,
    });
  });

  it("unblocks when the oldest counted failure leaves the window", () => {
    const five = [t0, t0 + min, t0 + 2 * min, t0 + 3 * min, t0 + 4 * min];
    expect(evaluateRateLimit(five, t0 + 15 * min, policy)).toEqual({
      limited: false,
    });
  });

  it("rounds the wait up to a whole second", () => {
    const five = [t0, t0, t0, t0, t0];
    expect(evaluateRateLimit(five, t0 + 15 * min - 1500, policy)).toEqual({
      limited: true,
      retryAfterSeconds: 2,
    });
  });
});
