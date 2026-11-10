// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, POST } from "./route";
import { BARISTA_COOKIE, verifyBaristaToken } from "@/lib/auth/baristaSession";

function post(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/barista/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("/api/barista/session", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
    vi.stubEnv("BARISTA_PASSCODE", "espresso42");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("POST", () => {
    it("sets a valid httpOnly session cookie for the right passcode", async () => {
      const response = await post({ passcode: "espresso42" });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      const cookie = response.cookies.get(BARISTA_COOKIE);
      expect(cookie?.httpOnly).toBe(true);
      expect(cookie?.sameSite).toBe("lax");
      await expect(verifyBaristaToken(cookie?.value)).resolves.toBe(true);
    });

    it("returns 401 without a cookie for a wrong passcode", async () => {
      const response = await post({ passcode: "latte" });

      expect(response.status).toBe(401);
      expect((await response.json()).error).toBe("Incorrect passcode");
      expect(response.cookies.get(BARISTA_COOKIE)).toBeUndefined();
    });

    it("returns 422 when the passcode is missing", async () => {
      const response = await post({});

      expect(response.status).toBe(422);
      expect((await response.json()).errors[0]).toMatch(/^passcode/);
    });

    it("returns 422 for malformed JSON", async () => {
      const response = await post("{ nope");

      expect(response.status).toBe(422);
      expect((await response.json()).errors).toEqual(["Invalid JSON payload"]);
    });

    it("returns 500 when the server has no JWT secret", async () => {
      vi.stubEnv("JWT_SECRET", "");
      const response = await post({ passcode: "espresso42" });

      expect(response.status).toBe(500);
      expect(response.cookies.get(BARISTA_COOKIE)).toBeUndefined();
    });
  });

  describe("DELETE", () => {
    it("clears the session cookie", async () => {
      const response = await DELETE();

      expect(response.status).toBe(200);
      const cookie = response.cookies.get(BARISTA_COOKIE);
      expect(cookie?.value).toBe("");
      expect(cookie?.maxAge).toBe(0);
    });
  });
});
