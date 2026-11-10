import { afterEach, describe, expect, it } from "vitest";
import {
  checkLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
  resetLoginRateLimiter,
} from "./loginRateLimiter";

const t0 = Date.parse("2026-11-10T12:00:00Z");
const min = 60 * 1000;

function fail(email: string, ip: string, times: number, at = t0) {
  for (let i = 0; i < times; i++) recordLoginFailure({ email, ip }, at);
}

describe("login rate limiter", () => {
  afterEach(() => {
    resetLoginRateLimiter();
  });

  it("allows up to 5 failed attempts per email in 15 minutes", () => {
    fail("a@x.co", "1.1.1.1", 4);
    expect(checkLoginAllowed({ email: "a@x.co", ip: "1.1.1.1" }, t0)).toEqual({
      allowed: true,
    });

    fail("a@x.co", "1.1.1.1", 1);
    expect(checkLoginAllowed({ email: "a@x.co", ip: "9.9.9.9" }, t0)).toEqual({
      allowed: false,
      retryAfterSeconds: 15 * 60,
    });
  });

  it("limits one IP trying many emails", () => {
    for (let i = 0; i < 5; i++) fail(`user${i}@x.co`, "2.2.2.2", 1);

    expect(
      checkLoginAllowed({ email: "fresh@x.co", ip: "2.2.2.2" }, t0).allowed,
    ).toBe(false);
    expect(
      checkLoginAllowed({ email: "fresh@x.co", ip: "3.3.3.3" }, t0).allowed,
    ).toBe(true);
  });

  it("lets the email try again after the window", () => {
    fail("a@x.co", "1.1.1.1", 5);
    expect(
      checkLoginAllowed({ email: "a@x.co", ip: "4.4.4.4" }, t0 + 15 * min)
        .allowed,
    ).toBe(true);
  });

  it("clears an email's failures after a successful login", () => {
    fail("a@x.co", "1.1.1.1", 4);
    clearLoginFailures("a@x.co");
    fail("a@x.co", "5.5.5.5", 1);

    expect(
      checkLoginAllowed({ email: "a@x.co", ip: "6.6.6.6" }, t0).allowed,
    ).toBe(true);
  });

  it("keeps the IP count after a success so it can't be reset by one valid login", () => {
    for (let i = 0; i < 4; i++) fail(`user${i}@x.co`, "7.7.7.7", 1);
    clearLoginFailures("mine@x.co");
    fail("user9@x.co", "7.7.7.7", 1);

    expect(
      checkLoginAllowed({ email: "other@x.co", ip: "7.7.7.7" }, t0).allowed,
    ).toBe(false);
  });
});
