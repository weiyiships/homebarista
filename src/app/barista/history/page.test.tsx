import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import BaristaHistoryPage from "./page";
import { listFinishedOrders } from "@/lib/db/queries/orders";
import { verifyBaristaToken } from "@/lib/auth/baristaSession";
import { redirect } from "next/navigation";

vi.mock("@/lib/db/queries/orders", () => ({
  listFinishedOrders: vi.fn(),
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

describe("/barista/history page", () => {
  beforeEach(() => {
    vi.mocked(verifyBaristaToken).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the passcode page without a valid session", async () => {
    vi.mocked(verifyBaristaToken).mockResolvedValueOnce(false);

    await expect(BaristaHistoryPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith(
      "/barista/login?next=%2Fbarista%2Fhistory",
    );
    expect(listFinishedOrders).not.toHaveBeenCalled();
  });

  it("renders finished orders newest-first under the History tab", async () => {
    vi.mocked(listFinishedOrders).mockResolvedValueOnce([
      {
        id: "11111111-2222-4333-a444-555555555555",
        guestName: "Alice",
        status: "picked_up",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        finishedAt: new Date("2026-11-10T12:06:00.000Z"),
        drinkName: "Latte",
        optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
      },
      {
        id: "22222222-2222-4333-a444-555555555555",
        guestName: "Bob",
        status: "cancelled",
        createdAt: new Date("2026-11-10T12:02:00.000Z"),
        finishedAt: new Date("2026-11-10T12:08:00.000Z"),
        drinkName: "Espresso",
        optionsJson: { temp: "Hot", sizing: "Double" },
      },
    ]);

    render(await BaristaHistoryPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Order history" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const names = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);
    expect(names).toEqual(["Bob", "Alice"]);
  });

  it("shows a reconnecting state when history cannot load", async () => {
    vi.mocked(listFinishedOrders).mockRejectedValueOnce(new Error("db down"));

    render(await BaristaHistoryPage());

    expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
  });
});
