import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "./page";
import { verifyCustomerToken } from "@/lib/auth/customerSession";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth/customerSession", () => ({
  CUSTOMER_COOKIE: "hb_customer_session",
  verifyCustomerToken: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "token" }) }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

describe("/login page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", async () => {
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce(null);

    render(await LoginPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Log in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("sends a signed-in customer to the menu", async () => {
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce({
      id: "11111111-2222-4333-a444-555555555555",
      name: "Alice",
    });

    await expect(LoginPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/menu");
  });
});
