import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MyOrdersPage from "./page";
import { listOrdersForCustomer } from "@/lib/db/queries/orders";
import { verifyCustomerToken } from "@/lib/auth/customerSession";
import { redirect } from "next/navigation";

vi.mock("@/lib/db/queries/orders", () => ({
  listOrdersForCustomer: vi.fn(),
}));

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
}));

const alice = { id: "11111111-2222-4333-a444-555555555555", name: "Alice" };

function signedIn() {
  vi.mocked(verifyCustomerToken).mockResolvedValueOnce(alice);
}

describe("/my-orders page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends guests to log in", async () => {
    vi.mocked(verifyCustomerToken).mockResolvedValueOnce(null);

    await expect(MyOrdersPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
    expect(listOrdersForCustomer).not.toHaveBeenCalled();
  });

  it("lists only the signed-in customer's orders, newest first", async () => {
    signedIn();
    vi.mocked(listOrdersForCustomer).mockResolvedValueOnce([
      {
        id: "1a2b3c4d-2222-4333-a444-555555555555",
        status: "picked_up",
        createdAt: new Date("2026-11-01T12:00:00Z"),
        updatedAt: new Date("2026-11-01T12:10:00Z"),
        drinkName: "Latte",
        optionsJson: { temp: "Iced", sizing: "Large", milk: "Oat" },
      },
      {
        id: "9f8e7d6c-2222-4333-a444-555555555555",
        status: "cancelled",
        createdAt: new Date("2026-11-09T12:00:00Z"),
        updatedAt: new Date("2026-11-09T12:01:00Z"),
        drinkName: "Espresso",
        optionsJson: { temp: "Hot", sizing: "Double" },
      },
    ]);

    render(await MyOrdersPage());

    expect(listOrdersForCustomer).toHaveBeenCalledWith(alice.id);
    expect(
      screen.getByRole("heading", { level: 1, name: "My orders" }),
    ).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    const [newest, older] = cards;
    expect(within(newest).getByText("Espresso")).toBeInTheDocument();
    expect(within(newest).getByText("#9F8E7D")).toBeInTheDocument();
    expect(within(newest).getByText("Double · Hot")).toBeInTheDocument();
    expect(within(newest).getByText("Cancelled")).toBeInTheDocument();
    expect(
      within(newest).getByText((_, el) => el?.tagName === "TIME"),
    ).toHaveAttribute("datetime", "2026-11-09T12:00:00.000Z");

    expect(within(older).getByText("Latte")).toBeInTheDocument();
    expect(within(older).getByText("#1A2B3C")).toBeInTheDocument();
    expect(
      within(older).getByText("Large · Oat milk · Iced"),
    ).toBeInTheDocument();
    expect(within(older).getByText("Picked up")).toBeInTheDocument();
  });

  it("links in-progress orders to their live status page", async () => {
    signedIn();
    vi.mocked(listOrdersForCustomer).mockResolvedValueOnce([
      {
        id: "1a2b3c4d-2222-4333-a444-555555555555",
        status: "brewing",
        createdAt: new Date("2026-11-10T12:00:00Z"),
        updatedAt: new Date("2026-11-10T12:01:00Z"),
        drinkName: "Latte",
        optionsJson: {},
      },
    ]);

    render(await MyOrdersPage());

    expect(screen.getByText("Brewing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /track order/i })).toHaveAttribute(
      "href",
      "/order/1a2b3c4d-2222-4333-a444-555555555555",
    );
  });

  it("shows an empty state with a button to place an order", async () => {
    signedIn();
    vi.mocked(listOrdersForCustomer).mockResolvedValueOnce([]);

    render(await MyOrdersPage());

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Place an order" }),
    ).toHaveAttribute("href", "/menu");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("shows an error when the history cannot be loaded", async () => {
    signedIn();
    vi.mocked(listOrdersForCustomer).mockRejectedValueOnce(new Error("db"));

    render(await MyOrdersPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn’t load your orders/i,
    );
  });
});
