// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, POST } from "./route";
import { findCustomerByEmail } from "@/lib/db/queries/customers";
import { verifyPassword } from "@/lib/auth/password";
import { resetLoginRateLimiter } from "@/lib/auth/loginRateLimiter";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";

vi.mock("@/lib/db/queries/customers", () => ({
  findCustomerByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: vi.fn(),
}));

const id = "11111111-2222-4333-a444-555555555555";
const stored = {
  id,
  name: "Alice",
  email: "alice@example.com",
  passwordHash: "$2b$12$storedhash",
};

function post(body: unknown, ip = "203.0.113.7") {
  return POST(
    new NextRequest("http://localhost/api/customers/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `${ip}, 10.0.0.1`,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const credentials = { email: " Alice@Example.com ", password: "correct horse" };

describe("/api/customers/session", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetLoginRateLimiter();
  });

  describe("POST (log in)", () => {
    it("signs the customer in with a 7-day session cookie", async () => {
      vi.mocked(findCustomerByEmail).mockResolvedValueOnce(stored);
      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      const response = await post(credentials);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        id,
        name: "Alice",
        email: "alice@example.com",
      });
      expect(findCustomerByEmail).toHaveBeenCalledWith("alice@example.com");
      expect(verifyPassword).toHaveBeenCalledWith(
        "correct horse",
        "$2b$12$storedhash",
      );
      const cookie = response.cookies.get(CUSTOMER_COOKIE);
      expect(cookie?.httpOnly).toBe(true);
      expect(cookie?.maxAge).toBe(7 * 24 * 60 * 60);
      await expect(verifyCustomerToken(cookie?.value)).resolves.toEqual({
        id,
        name: "Alice",
      });
    });

    it("gives the same generic error for a wrong password", async () => {
      vi.mocked(findCustomerByEmail).mockResolvedValueOnce(stored);
      vi.mocked(verifyPassword).mockResolvedValueOnce(false);

      const response = await post(credentials);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Invalid email or password",
      });
      expect(response.cookies.get(CUSTOMER_COOKIE)).toBeUndefined();
    });

    it("gives the same generic error for an unknown email, still running bcrypt", async () => {
      vi.mocked(findCustomerByEmail).mockResolvedValueOnce(null);
      vi.mocked(verifyPassword).mockResolvedValueOnce(false);

      const response = await post(credentials);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Invalid email or password",
      });
      // Compared against a dummy hash so timing doesn't reveal the email.
      expect(verifyPassword).toHaveBeenCalledWith(
        "correct horse",
        expect.stringMatching(/^\$2[aby]\$12\$/),
      );
    });

    it("returns 429 after 5 failed attempts for an email in 15 minutes", async () => {
      vi.mocked(findCustomerByEmail).mockResolvedValue(stored);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        expect((await post(credentials, `198.51.100.${i}`)).status).toBe(401);
      }
      vi.mocked(verifyPassword).mockResolvedValue(true);
      const blocked = await post(credentials, "198.51.100.99");

      expect(blocked.status).toBe(429);
      expect(blocked.headers.get("retry-after")).toBe("900");
      expect(await blocked.json()).toEqual({
        error: "Too many failed attempts. Try again in 15 minutes.",
      });
      expect(blocked.cookies.get(CUSTOMER_COOKIE)).toBeUndefined();
      expect(verifyPassword).toHaveBeenCalledTimes(5);
    });

    it("rate-limits one IP trying many emails", async () => {
      vi.mocked(findCustomerByEmail).mockResolvedValue(null);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        await post({ email: `user${i}@x.co`, password: "guess1234" });
      }

      expect(
        (await post({ email: "new@x.co", password: "guess1234" })).status,
      ).toBe(429);
    });

    it("returns 422 for invalid input without counting an attempt", async () => {
      const response = await post({ email: "nope", password: "" });

      expect(response.status).toBe(422);
      expect(findCustomerByEmail).not.toHaveBeenCalled();
    });

    it("returns 422 for malformed JSON", async () => {
      const response = await post("{ nope");

      expect(response.status).toBe(422);
      expect((await response.json()).errors).toEqual(["Invalid JSON payload"]);
    });

    it("returns 500 when the lookup fails", async () => {
      vi.mocked(findCustomerByEmail).mockRejectedValueOnce(new Error("db"));

      const response = await post(credentials);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Could not log you in. Please try again.",
      });
    });
  });

  describe("DELETE (log out)", () => {
    it("clears the session cookie", async () => {
      const response = await DELETE();

      expect(response.status).toBe(200);
      const cookie = response.cookies.get(CUSTOMER_COOKIE);
      expect(cookie?.value).toBe("");
      expect(cookie?.maxAge).toBe(0);
    });
  });
});
