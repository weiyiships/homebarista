import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuPage from "./page";
import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";
import { verifyCustomerToken } from "@/lib/auth/customerSession";

vi.mock("@/lib/db/queries/menu", () => ({
  listMenuItems: vi.fn(),
  listMilkOptions: vi.fn(),
}));

vi.mock("@/lib/auth/customerSession", () => ({
  CUSTOMER_COOKIE: "hb_customer_session",
  verifyCustomerToken: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "token" }) }),
}));

describe("/menu page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes the signed-in customer to the menu", async () => {
    vi.mocked(listMenuItems).mockRejectedValueOnce(new Error("no db"));
    vi.mocked(listMilkOptions).mockResolvedValueOnce([]);
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce({
      id: "11111111-2222-4333-a444-555555555555",
      name: "Alice",
    });

    render(await MenuPage());

    expect(screen.getByText("Signed in as Alice")).toBeInTheDocument();
  });

  it("renders the guest menu without a session", async () => {
    vi.mocked(listMenuItems).mockRejectedValueOnce(new Error("no db"));
    vi.mocked(listMilkOptions).mockResolvedValueOnce([]);
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce(null);

    render(await MenuPage());

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^latte/i })).toBeInTheDocument();
  });
});
