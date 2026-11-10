import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BaristaAvailabilityPage from "./page";
import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";
import { verifyBaristaToken } from "@/lib/auth/baristaSession";
import { redirect } from "next/navigation";

vi.mock("@/lib/db/queries/menu", () => ({
  listMenuItems: vi.fn(),
  listMilkOptions: vi.fn(),
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

describe("/barista/availability page", () => {
  beforeEach(() => {
    vi.mocked(verifyBaristaToken).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the passcode page without a valid session", async () => {
    vi.mocked(verifyBaristaToken).mockResolvedValueOnce(false);

    await expect(BaristaAvailabilityPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith(
      "/barista/login?next=%2Fbarista%2Favailability",
    );
    expect(listMenuItems).not.toHaveBeenCalled();
  });

  it("renders drink and milk toggles under the Availability tab", async () => {
    vi.mocked(listMenuItems).mockResolvedValueOnce([
      {
        id: "11111111-2222-4333-a444-555555555555",
        name: "Latte",
        available: false,
        takesMilk: true,
        sizeType: "size",
      },
    ]);
    vi.mocked(listMilkOptions).mockResolvedValueOnce([
      {
        id: "22222222-2222-4333-a444-555555555555",
        type: "milk",
        label: "Oat",
        available: true,
      },
    ]);

    render(await BaristaAvailabilityPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Availability" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Availability" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("switch", { name: "Latte" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("switch", { name: "Oat" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("shows an error state when the menu fails to load", async () => {
    vi.mocked(listMenuItems).mockRejectedValueOnce(new Error("db down"));
    vi.mocked(listMilkOptions).mockResolvedValueOnce([]);

    render(await BaristaAvailabilityPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load the menu/i,
    );
  });
});
