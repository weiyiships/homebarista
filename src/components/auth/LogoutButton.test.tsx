import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "./LogoutButton";

const routerReplace = vi.fn();
const routerRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, refresh: routerRefresh }),
}));

describe("LogoutButton", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    routerReplace.mockReset();
    routerRefresh.mockReset();
  });

  it("clears the session and returns to the menu", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    render(<LogoutButton />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Log out" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/customers/session", {
      method: "DELETE",
    });
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/menu"));
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("reports a failed logout", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(<LogoutButton />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn’t log out/i,
    );
    expect(routerReplace).not.toHaveBeenCalled();
  });
});
