import { describe, expect, it } from "vitest";
import { POST as signup } from "@/app/api/customers/route";
import {
  DELETE as logout,
  POST as login,
} from "@/app/api/customers/session/route";
import { GET as myOrders } from "@/app/api/customers/me/orders/route";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { request, sessionCookie } from "./support/http";

const ada = {
  name: "Ada",
  email: "Ada@Example.com",
  password: "correct horse",
};

describe("POST /api/customers", () => {
  it("creates the account with a bcrypt hash and sets a session cookie", async () => {
    const response = await signup(request("/api/customers", { body: ada }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      name: "Ada",
      email: "ada@example.com",
    });
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);

    const [row] = await db.select().from(customers);
    expect(row?.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(row?.passwordHash).not.toContain(ada.password);
  });

  it("rejects a duplicate email with 409, case-insensitively", async () => {
    await signup(request("/api/customers", { body: ada }));
    const again = await signup(
      request("/api/customers", { body: { ...ada, email: "ADA@example.com" } }),
    );
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({ login_url: "/login" });
  });

  it("returns field errors with 422", async () => {
    const response = await signup(
      request("/api/customers", {
        body: { name: "", email: "x", password: "short" },
      }),
    );
    expect(response.status).toBe(422);
    expect(Object.keys((await response.json()).field_errors).sort()).toEqual([
      "email",
      "name",
      "password",
    ]);
    expect(
      (await signup(request("/api/customers", { method: "POST", raw: "{" })))
        .status,
    ).toBe(422);
  });
});

describe("customer session", () => {
  it("logs in with the right password and rejects the wrong one", async () => {
    await signup(request("/api/customers", { body: ada }));

    const ok = await login(
      request("/api/customers/session", {
        body: { email: "ada@example.com", password: ada.password },
      }),
    );
    expect(ok.status).toBe(200);
    const orders = await myOrders(
      request("/api/customers/me/orders", { cookie: sessionCookie(ok) }),
    );
    expect(await orders.json()).toEqual({ orders: [] });

    const wrong = await login(
      request("/api/customers/session", {
        body: { email: "ada@example.com", password: "wrong password" },
      }),
    );
    expect(wrong.status).toBe(401);
  });

  it("gives an unknown email the same 401 as a wrong password", async () => {
    const response = await login(
      request("/api/customers/session", {
        body: { email: "nobody@example.com", password: "whatever" },
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Invalid email or password",
    });
  });

  it("rate-limits repeated failures with 429 and Retry-After", async () => {
    const attempt = () =>
      login(
        request("/api/customers/session", {
          body: { email: "ada@example.com", password: "wrong password" },
        }),
      );
    let response = await attempt();
    for (let i = 0; i < 10 && response.status !== 429; i += 1) {
      response = await attempt();
    }
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
  }, 30_000);

  it("limits failures per client IP, taking the first x-forwarded-for hop", async () => {
    const attempt = (email: string, headers: Record<string, string>) =>
      login(
        request("/api/customers/session", {
          headers,
          body: { email, password: "wrong password" },
        }),
      );
    const proxied = { "x-forwarded-for": "203.0.113.7, 10.0.0.1" };
    // Five failures from one IP, each for a different email (limit is 5).
    for (let i = 0; i < 5; i += 1) {
      expect((await attempt(`user${i}@example.com`, proxied)).status).toBe(401);
    }
    // The IP is now blocked, even for an email it never tried.
    expect((await attempt("fresh@example.com", proxied)).status).toBe(429);
    // Same client behind a different proxy hop: still the same IP.
    expect(
      (await attempt("fresh@example.com", { "x-forwarded-for": "203.0.113.7" }))
        .status,
    ).toBe(429);
    // Another client, identified by x-real-ip, is unaffected.
    expect(
      (await attempt("fresh@example.com", { "x-real-ip": "198.51.100.2" }))
        .status,
    ).toBe(401);
  }, 30_000);

  it("validates the login body", async () => {
    expect(
      (await login(request("/api/customers/session", { body: { email: "x" } })))
        .status,
    ).toBe(422);
    expect(
      (
        await login(
          request("/api/customers/session", { method: "POST", raw: "{" }),
        )
      ).status,
    ).toBe(422);
  });

  it("logs out by expiring the cookie", async () => {
    const response = await logout();
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });
});

describe("GET /api/customers/me/orders", () => {
  it("returns 401 without a valid session", async () => {
    expect((await myOrders(request("/api/customers/me/orders"))).status).toBe(
      401,
    );
    expect(
      (
        await myOrders(
          request("/api/customers/me/orders", {
            cookie: "hb_customer_session=forged",
          }),
        )
      ).status,
    ).toBe(401);
  });
});
