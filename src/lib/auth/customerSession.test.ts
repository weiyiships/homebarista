// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CUSTOMER_SESSION_TTL_SECONDS,
  createCustomerToken,
  customerCookieOptions,
  getCustomerFromRequest,
  verifyCustomerToken,
} from "./customerSession";
import { createBaristaToken, verifyBaristaToken } from "./baristaSession";

const customer = {
  id: "11111111-2222-4333-a444-555555555555",
  name: "Alice",
};

describe("customer session", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("expires after 7 days", () => {
    expect(CUSTOMER_SESSION_TTL_SECONDS).toBe(7 * 24 * 60 * 60);
  });

  it("round-trips the customer id and name", async () => {
    const token = await createCustomerToken(customer);
    await expect(verifyCustomerToken(token)).resolves.toEqual(customer);
  });

  it("rejects missing, malformed, and expired tokens", async () => {
    await expect(verifyCustomerToken(undefined)).resolves.toBeNull();
    await expect(verifyCustomerToken("nope")).resolves.toBeNull();

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    const token = await createCustomerToken(customer);
    vi.setSystemTime(new Date("2026-11-08T00:00:01Z"));
    await expect(verifyCustomerToken(token)).resolves.toBeNull();
  });

  it("keeps customer and barista tokens apart", async () => {
    const customerToken = await createCustomerToken(customer);
    const baristaToken = await createBaristaToken();

    await expect(verifyBaristaToken(customerToken)).resolves.toBe(false);
    await expect(verifyCustomerToken(baristaToken)).resolves.toBeNull();
  });

  it("uses a secure, httpOnly, same-site cookie for 7 days", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(customerCookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: CUSTOMER_SESSION_TTL_SECONDS,
    });
  });
});

describe("getCustomerFromRequest", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the session from the cookie header", async () => {
    const token = await createCustomerToken(customer);
    const request = new Request("http://localhost/", {
      headers: { cookie: `theme=dark; hb_customer_session=${token}; x=1` },
    });

    await expect(getCustomerFromRequest(request)).resolves.toEqual(customer);
  });

  it("returns null without a session cookie", async () => {
    const request = new Request("http://localhost/", {
      headers: { cookie: "theme=dark" },
    });

    await expect(getCustomerFromRequest(request)).resolves.toBeNull();
    await expect(
      getCustomerFromRequest(new Request("http://localhost/")),
    ).resolves.toBeNull();
  });
});
