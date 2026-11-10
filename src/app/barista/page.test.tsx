import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BaristaPage from "./page";
import { listActiveOrders } from "@/lib/db/queries/orders";
import { verifyBaristaToken } from "@/lib/auth/baristaSession";
import { redirect } from "next/navigation";

vi.mock("@/lib/db/queries/orders", () => ({
  listActiveOrders: vi.fn(),
}));

vi.mock("@/lib/auth/baristaSession", () => ({
  BARISTA_COOKIE: "hb_barista_session",
  verifyBaristaToken: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "hb_barista_session" ? { value: "token" } : undefined,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

describe("/barista page", () => {
  beforeEach(() => {
    vi.mocked(verifyBaristaToken).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the passcode page without a valid session", async () => {
    vi.mocked(verifyBaristaToken).mockResolvedValueOnce(false);

    await expect(BaristaPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/barista/login?next=%2Fbarista");
    expect(listActiveOrders).not.toHaveBeenCalled();
  });

  it("renders active orders oldest-first", async () => {
    vi.mocked(listActiveOrders).mockResolvedValueOnce([
      {
        id: "22222222-2222-4333-a444-555555555555",
        guestName: "Bob",
        status: "received",
        createdAt: new Date("2026-11-10T12:05:00.000Z"),
        drinkName: "Espresso",
        optionsJson: { temp: "Hot", sizing: "Single" },
      },
      {
        id: "11111111-2222-4333-a444-555555555555",
        guestName: "Alice",
        status: "brewing",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        drinkName: "Latte",
        optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
      },
    ]);

    render(await BaristaPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Barista queue" }),
    ).toBeInTheDocument();
    const names = screen
      .getAllByRole("article")
      .map((card) => card.querySelector("h3")?.textContent);
    expect(names).toEqual(["Alice", "Bob"]);
    expect(screen.getByText("Oat milk")).toBeInTheDocument();
  });

  it("shows a reconnecting state when the queue cannot load", async () => {
    vi.mocked(listActiveOrders).mockRejectedValueOnce(new Error("db down"));

    render(await BaristaPage());

    expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
  });
});
