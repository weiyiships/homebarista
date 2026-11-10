import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaristaAvailability } from "./BaristaAvailability";
import type { AvailabilityView } from "@/lib/domain/availability";

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

const LATTE_ID = "11111111-2222-4333-a444-555555555555";
const ESPRESSO_ID = "33333333-2222-4333-a444-555555555555";
const OAT_ID = "22222222-2222-4333-a444-555555555555";

const initial: AvailabilityView = {
  drinks: [
    { id: ESPRESSO_ID, label: "Espresso", available: false },
    { id: LATTE_ID, label: "Latte", available: true },
  ],
  milks: [{ id: OAT_ID, label: "Oat", available: true }],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("BaristaAvailability", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    routerReplace.mockReset();
  });

  it("shows a toggle for every drink and milk with its current state", () => {
    render(<BaristaAvailability initial={initial} />);

    const drinks = screen.getByRole("region", { name: "Drinks" });
    const milks = screen.getByRole("region", { name: "Milks" });

    expect(
      within(drinks).getByRole("switch", { name: "Espresso" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(
      within(drinks).getByRole("switch", { name: "Latte" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(within(milks).getByRole("switch", { name: "Oat" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("labels each row with a text state, not color alone", () => {
    render(<BaristaAvailability initial={initial} />);

    const espressoRow = screen.getByRole("listitem", { name: "Espresso" });
    const latteRow = screen.getByRole("listitem", { name: "Latte" });
    expect(within(espressoRow).getByText("Unavailable")).toBeInTheDocument();
    expect(within(latteRow).getByText("On menu")).toBeInTheDocument();
  });

  it("turns a drink off and sends the change to the server", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        kind: "drink",
        item: { id: LATTE_ID, label: "Latte", available: false },
      }),
    );
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Latte" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/barista/availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ kind: "drink", id: LATTE_ID, available: false }),
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Latte" })).toHaveAttribute(
        "aria-checked",
        "false",
      ),
    );
    expect(
      within(screen.getByRole("listitem", { name: "Latte" })).getByText(
        "Unavailable",
      ),
    ).toBeInTheDocument();
  });

  it("turns a milk back on", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        kind: "milk",
        item: { id: OAT_ID, label: "Oat", available: false },
      }),
    );
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Oat" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/barista/availability",
      expect.objectContaining({
        body: JSON.stringify({ kind: "milk", id: OAT_ID, available: false }),
      }),
    );
  });

  it("disables a toggle while its change is saving", async () => {
    let resolve: (r: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((r) => {
        resolve = r;
      }),
    );
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Latte" }));

    const latte = screen.getByRole("switch", { name: "Latte" });
    expect(latte).toBeDisabled();
    expect(latte).toHaveAttribute("aria-checked", "false");

    resolve(
      jsonResponse({
        kind: "drink",
        item: { id: LATTE_ID, label: "Latte", available: false },
      }),
    );
    await waitFor(() => expect(latte).not.toBeDisabled());
  });

  it("reverts the toggle and shows an error when saving fails", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Failed to update availability" }, 500),
    );
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Latte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't update Latte. Please try again.",
    );
    expect(screen.getByRole("switch", { name: "Latte" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("reverts and shows an error on a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Espresso" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't update Espresso. Please try again.",
    );
    expect(screen.getByRole("switch", { name: "Espresso" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("sends the barista to sign in when the session expires", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Unauthorized" }, 401),
    );
    const user = userEvent.setup();
    render(<BaristaAvailability initial={initial} />);

    await user.click(screen.getByRole("switch", { name: "Latte" }));

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/barista/login?next=%2Fbarista%2Favailability",
      ),
    );
  });

  it("shows an error state when the first load failed", () => {
    render(
      <BaristaAvailability initial={{ drinks: [], milks: [] }} loadFailed />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load the menu/i,
    );
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
  });

  it("shows an empty state when the menu has no items", () => {
    render(<BaristaAvailability initial={{ drinks: [], milks: [] }} />);

    expect(screen.getByText(/no drinks on the menu yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no milks on the menu yet/i)).toBeInTheDocument();
  });
});
