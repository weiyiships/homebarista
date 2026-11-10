import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SignupPage from "./page";
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

describe("/signup page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the optional signup form", async () => {
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce(null);

    render(await SignupPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Create an account" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/optional/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("sends a signed-in customer to the menu", async () => {
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce({
      id: "11111111-2222-4333-a444-555555555555",
      name: "Alice",
    });

    await expect(SignupPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/menu");
  });
});
