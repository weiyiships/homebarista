import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

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

describe("LoginForm", () => {
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

  async function logIn(email: string, password: string) {
    const user = userEvent.setup();
    if (email) await user.type(screen.getByLabelText("Email"), email);
    if (password) await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: "Log in" }));
  }

  it("asks for email and password with sign-in autocomplete", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("links to signup and keeps guest ordering available", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.getByRole("link", { name: "Continue as guest" }),
    ).toHaveAttribute("href", "/menu");
  });

  it("logs in and returns to the menu", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "x", name: "Alice", email: "alice@example.com" }),
    );
    render(<LoginForm />);

    await logIn("Alice@Example.com", "correct horse");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customers/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "alice@example.com",
          password: "correct horse",
        }),
      }),
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/menu"));
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("shows the generic error and clears the password on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Invalid email or password" }, 401),
    );
    render(<LoginForm />);

    await logIn("alice@example.com", "wrong horse");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("alice@example.com");
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("shows the rate-limit message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: "Too many failed attempts. Try again in 15 minutes." },
        429,
      ),
    );
    render(<LoginForm />);

    await logIn("alice@example.com", "guess1234");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many failed attempts. Try again in 15 minutes.",
    );
  });

  it("validates before sending", async () => {
    render(<LoginForm />);

    await logIn("alice@", "");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter your email and password.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a network error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(<LoginForm />);

    await logIn("alice@example.com", "correct horse");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /network error/i,
    );
  });
});
