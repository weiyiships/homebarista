import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MenuClient } from "./MenuClient";
import { type Drink } from "@/lib/domain/menu";

const LATTE_ID = "11111111-2222-4333-a444-555555555555";

const latte: Drink = {
  id: LATTE_ID,
  name: "Latte",
  available: true,
  takesMilk: true,
  sizeType: "size",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function latteCard() {
  return screen.getByRole("button", { name: /^latte/i });
}

describe("MenuClient live availability", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("polls the menu every 2.5 seconds and disables drinks turned off", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        drinks: [
          {
            id: LATTE_ID,
            name: "Latte",
            available: false,
            takes_milk: true,
            size_type: "size",
          },
        ],
        unavailable_milks: [],
      }),
    );
    render(<MenuClient drinks={[latte]} unavailableMilks={[]} />);
    expect(latteCard()).toHaveAttribute("aria-disabled", "false");

    await act(() => vi.advanceTimersByTimeAsync(2500));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/menu",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(latteCard()).toHaveAttribute("aria-disabled", "true");
    expect(latteCard()).toHaveTextContent("Unavailable");
  });

  it("disables a milk in the open drawer once it is turned off", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        drinks: [
          {
            id: LATTE_ID,
            name: "Latte",
            available: true,
            takes_milk: true,
            size_type: "size",
          },
        ],
        unavailable_milks: ["Oat"],
      }),
    );
    render(<MenuClient drinks={[latte]} unavailableMilks={[]} />);

    act(() => latteCard().click());
    expect(screen.getByRole("radio", { name: /oat/i })).toBeEnabled();

    await act(() => vi.advanceTimersByTimeAsync(2500));

    expect(screen.getByRole("radio", { name: /oat/i })).toBeDisabled();
  });

  it("keeps the current menu when a poll fails or is malformed", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    fetchMock.mockResolvedValueOnce(jsonResponse({ nope: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "down" }, 500));
    render(<MenuClient drinks={[latte]} unavailableMilks={["Oat"]} />);

    await act(() => vi.advanceTimersByTimeAsync(7500));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(latteCard()).toHaveAttribute("aria-disabled", "false");
  });

  it("stops polling after unmount", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ drinks: [], unavailable_milks: [] }),
    );
    const { unmount } = render(
      <MenuClient drinks={[latte]} unavailableMilks={[]} />,
    );
    unmount();

    await act(() => vi.advanceTimersByTimeAsync(5000));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
