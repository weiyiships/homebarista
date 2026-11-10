// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import {
  BARISTA_COOKIE,
  createBaristaToken,
} from "@/lib/auth/baristaSession";

function request(path: string, token?: string, method = "GET") {
  const headers = new Headers();
  if (token) headers.set("cookie", `${BARISTA_COOKIE}=${token}`);
  return new NextRequest(`http://localhost${path}`, { headers, method });
}

function isPassThrough(response: Response) {
  return response.headers.get("x-middleware-next") === "1";
}

describe("middleware", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects /barista to the passcode page without a session", async () => {
    const response = await middleware(request("/barista"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/barista/login?next=%2Fbarista",
    );
  });

  it("redirects nested barista pages and keeps where to return", async () => {
    const response = await middleware(request("/barista/history"));

    expect(response.headers.get("location")).toBe(
      "http://localhost/barista/login?next=%2Fbarista%2Fhistory",
    );
  });

  it("lets a barista session through to /barista", async () => {
    const token = await createBaristaToken();
    const response = await middleware(request("/barista", token));

    expect(isPassThrough(response)).toBe(true);
  });

  it("always serves the passcode page to guests", async () => {
    const response = await middleware(request("/barista/login"));

    expect(isPassThrough(response)).toBe(true);
  });

  it("sends a logged-in barista from the passcode page to the queue", async () => {
    const token = await createBaristaToken();
    const response = await middleware(request("/barista/login", token));

    expect(response.headers.get("location")).toBe("http://localhost/barista");
  });

  it("returns 401 for barista APIs without a session", async () => {
    const response = await middleware(request("/api/barista/queue"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("leaves the passcode login API open", async () => {
    const response = await middleware(
      request("/api/barista/session", undefined, "POST"),
    );

    expect(isPassThrough(response)).toBe(true);
  });

  it("protects order status changes", async () => {
    const path = "/api/orders/11111111-2222-4333-a444-555555555555/status";

    const guest = await middleware(request(path, undefined, "PATCH"));
    expect(guest.status).toBe(401);

    const token = await createBaristaToken();
    const barista = await middleware(request(path, token, "PATCH"));
    expect(isPassThrough(barista)).toBe(true);
  });

  it("rejects a forged session cookie", async () => {
    const response = await middleware(request("/api/barista/queue", "forged"));

    expect(response.status).toBe(401);
  });
});
