// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { createCustomer } from "@/lib/db/queries/customers";
import { hashPassword } from "@/lib/auth/password";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";

vi.mock("@/lib/db/queries/customers", () => ({
  createCustomer: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async () => "$2b$12$hashedvalue"),
}));

const id = "11111111-2222-4333-a444-555555555555";

function post(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const valid = {
  name: " Alice ",
  email: "Alice@Example.com",
  password: "correct horse",
};

describe("POST /api/customers", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("creates the account with a hashed password and signs the customer in", async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce({
      ok: true,
      customer: { id, name: "Alice", email: "alice@example.com" },
    });

    const response = await post(valid);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id,
      name: "Alice",
      email: "alice@example.com",
    });
    expect(hashPassword).toHaveBeenCalledWith("correct horse");
    expect(createCustomer).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "$2b$12$hashedvalue",
    });

    const cookie = response.cookies.get(CUSTOMER_COOKIE);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.maxAge).toBe(7 * 24 * 60 * 60);
    await expect(verifyCustomerToken(cookie?.value)).resolves.toEqual({
      id,
      name: "Alice",
    });
  });

  it("never echoes the password back", async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce({
      ok: true,
      customer: { id, name: "Alice", email: "alice@example.com" },
    });

    const response = await post(valid);

    expect(await response.text()).not.toContain("correct horse");
  });

  it("returns 409 with a login link when the email is taken", async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce({
      ok: false,
      reason: "email_taken",
    });

    const response = await post(valid);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "An account with this email already exists",
      login_url: "/login",
    });
    expect(response.cookies.get(CUSTOMER_COOKIE)).toBeUndefined();
  });

  it("returns 422 with field errors for invalid input", async () => {
    const response = await post({ name: "", email: "x", password: "short" });

    expect(response.status).toBe(422);
    const json = await response.json();
    expect(json.field_errors).toEqual({
      name: "Name is required",
      email: "Enter a valid email address",
      password: "Password must be at least 8 characters",
    });
    expect(json.errors).toHaveLength(3);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it("returns 422 for malformed JSON", async () => {
    const response = await post("{ nope");

    expect(response.status).toBe(422);
    expect((await response.json()).errors).toEqual(["Invalid JSON payload"]);
  });

  it("returns 500 when the account cannot be saved", async () => {
    vi.mocked(createCustomer).mockRejectedValueOnce(new Error("db down"));

    const response = await post(valid);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Could not create your account. Please try again.",
    });
    expect(response.cookies.get(CUSTOMER_COOKIE)).toBeUndefined();
  });
});
