import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasscodeForm } from "./PasscodeForm";

const routerReplace = vi.fn();
const routerRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, refresh: routerRefresh }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("PasscodeForm", () => {
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

  async function submit(passcode: string) {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Barista passcode"), passcode);
    await user.click(screen.getByRole("button", { name: "Unlock queue" }));
  }

  it("uses a password field", () => {
    render(<PasscodeForm next="/barista" />);
    expect(screen.getByLabelText("Barista passcode")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("posts the passcode and opens the queue", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    render(<PasscodeForm next="/barista" />);

    await submit("espresso42");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/barista/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ passcode: "espresso42" }),
      }),
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/barista"));
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("returns to the requested barista page", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    render(<PasscodeForm next="/barista/history" />);

    await submit("espresso42");

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith("/barista/history"),
    );
  });

  it.each(["https://evil.example", "//evil.example", "/menu", "/baristaX"])(
    "ignores an unsafe next target %s",
    async (next) => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
      render(<PasscodeForm next={next} />);

      await submit("espresso42");

      await waitFor(() =>
        expect(routerReplace).toHaveBeenCalledWith("/barista"),
      );
    },
  );

  it("shows the server error for a wrong passcode", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Incorrect passcode" }, 401),
    );
    render(<PasscodeForm next="/barista" />);

    await submit("latte");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect passcode",
    );
    expect(routerReplace).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Barista passcode")).toHaveValue("");
  });

  it("requires a passcode before submitting", async () => {
    const user = userEvent.setup();
    render(<PasscodeForm next="/barista" />);

    await user.click(screen.getByRole("button", { name: "Unlock queue" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the passcode.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a network error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(<PasscodeForm next="/barista" />);

    await submit("espresso42");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /network error/i,
    );
  });
});
