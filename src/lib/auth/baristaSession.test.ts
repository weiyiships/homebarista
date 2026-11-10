// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import {
  BARISTA_SESSION_TTL_SECONDS,
  baristaCookieOptions,
  createBaristaToken,
  verifyBaristaToken,
  verifyPasscode,
} from "./baristaSession";

const SECRET = "test-secret-that-is-at-least-32-characters-long";

describe("barista session", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", SECRET);
    vi.stubEnv("BARISTA_PASSCODE", "espresso42");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe("verifyPasscode", () => {
    it("accepts the configured passcode", async () => {
      await expect(verifyPasscode("espresso42")).resolves.toBe(true);
    });

    it("rejects a wrong passcode", async () => {
      await expect(verifyPasscode("espresso43")).resolves.toBe(false);
      await expect(verifyPasscode("")).resolves.toBe(false);
    });

    it("rejects everything when no passcode is configured", async () => {
      vi.stubEnv("BARISTA_PASSCODE", "");
      await expect(verifyPasscode("")).resolves.toBe(false);
    });
  });

  describe("tokens", () => {
    it("verifies a token it issued", async () => {
      const token = await createBaristaToken();
      await expect(verifyBaristaToken(token)).resolves.toBe(true);
    });

    it("rejects a missing or malformed token", async () => {
      await expect(verifyBaristaToken(undefined)).resolves.toBe(false);
      await expect(verifyBaristaToken("not.a.jwt")).resolves.toBe(false);
    });

    it("rejects a token signed with another secret", async () => {
      const token = await createBaristaToken();
      vi.stubEnv("JWT_SECRET", "another-secret-that-is-also-32-chars-long!");
      await expect(verifyBaristaToken(token)).resolves.toBe(false);
    });

    it("rejects a token without the barista role", async () => {
      const token = await new SignJWT({ role: "customer" })
        .setProtectedHeader({ alg: "HS256" })
        .setAudience("barista")
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode(SECRET));
      await expect(verifyBaristaToken(token)).resolves.toBe(false);
    });

    it("rejects an expired token", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-11-10T08:00:00.000Z"));
      const token = await createBaristaToken();
      vi.setSystemTime(
        new Date(
          Date.parse("2026-11-10T08:00:00.000Z") +
            (BARISTA_SESSION_TTL_SECONDS + 1) * 1000,
        ),
      );
      await expect(verifyBaristaToken(token)).resolves.toBe(false);
    });

    it("refuses to sign without a strong JWT_SECRET", async () => {
      vi.stubEnv("JWT_SECRET", "short");
      await expect(createBaristaToken()).rejects.toThrow(/JWT_SECRET/);
    });

    it("treats a misconfigured secret as an invalid session", async () => {
      const token = await createBaristaToken();
      vi.stubEnv("JWT_SECRET", "");
      await expect(verifyBaristaToken(token)).resolves.toBe(false);
    });
  });

  describe("baristaCookieOptions", () => {
    it("is httpOnly, same-site, and scoped to the session lifetime", () => {
      expect(baristaCookieOptions()).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: BARISTA_SESSION_TTL_SECONDS,
      });
    });

    it("is secure in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(baristaCookieOptions().secure).toBe(true);
    });
  });
});
