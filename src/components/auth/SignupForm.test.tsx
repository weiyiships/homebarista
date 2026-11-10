import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./SignupForm";

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

describe("SignupForm", () => {
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

  async function fill(values: {
    name?: string;
    email?: string;
    password?: string;
  }) {
    const user = userEvent.setup();
    if (values.name)
      await user.type(screen.getByLabelText("Name"), values.name);
    if (values.email)
      await user.type(screen.getByLabelText("Email"), values.email);
    if (values.password)
      await user.type(screen.getByLabelText("Password"), values.password);
    await user.click(screen.getByRole("button", { name: "Create account" }));
  }

  it("asks for name, email, and a password of at least 8 characters", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "autocomplete",
      "name",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "new-password");
    expect(password).toHaveAccessibleDescription("At least 8 characters.");
  });

  it("keeps ordering as a guest one tap away", () => {
    render(<SignupForm />);
    expect(
      screen.getByRole("link", { name: "Continue as guest" }),
    ).toHaveAttribute("href", "/menu");
  });

  it("creates the account and goes to the menu", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          id: "11111111-2222-4333-a444-555555555555",
          name: "Alice",
          email: "alice@example.com",
        },
        201,
      ),
    );
    render(<SignupForm />);

    await fill({
      name: "Alice",
      email: "Alice@Example.com",
      password: "correct horse",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Alice",
          email: "alice@example.com",
          password: "correct horse",
        }),
      }),
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/menu"));
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("shows field errors before sending invalid input", async () => {
    render(<SignupForm />);

    await fill({ email: "alice@", password: "short" });

    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Name is required",
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address",
    );
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Password must be at least 8 characters",
    );
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains a duplicate email and links to log in", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: "An account with this email already exists",
          login_url: "/login",
        },
        409,
      ),
    );
    render(<SignupForm />);

    await fill({
      name: "Alice",
      email: "alice@example.com",
      password: "correct horse",
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "An account with this email already exists",
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("shows server field errors", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          errors: ["email: Enter a valid email address"],
          field_errors: { email: "Enter a valid email address" },
        },
        422,
      ),
    );
    render(<SignupForm />);

    await fill({
      name: "Alice",
      email: "alice@example.com",
      password: "correct horse",
    });

    await waitFor(() =>
      expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
        "Enter a valid email address",
      ),
    );
  });

  it("shows a generic error when the server fails", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: "Could not create your account. Please try again." },
        500,
      ),
    );
    render(<SignupForm />);

    await fill({
      name: "Alice",
      email: "alice@example.com",
      password: "correct horse",
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not create your account. Please try again.",
    );
  });

  it("shows a network error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(<SignupForm />);

    await fill({
      name: "Alice",
      email: "alice@example.com",
      password: "correct horse",
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /network error/i,
    );
  });
});
