import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteHeaderView } from "./SiteHeaderView";

describe("SiteHeaderView", () => {
  it("is the page banner with a brand link home", () => {
    render(<SiteHeaderView customer={null} />);

    const banner = screen.getByRole("banner");
    expect(
      within(banner).getByRole("link", { name: "Home Barista" }),
    ).toHaveAttribute("href", "/");
  });

  it("links to the main sections", () => {
    render(<SiteHeaderView customer={null} />);

    const main = screen.getByRole("navigation", { name: "Main" });
    expect(within(main).getByRole("link", { name: "Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
    expect(within(main).getByRole("link", { name: "Barista" })).toHaveAttribute(
      "href",
      "/barista",
    );
    expect(
      within(main).queryByRole("link", { name: "My orders" }),
    ).not.toBeInTheDocument();
  });

  it("offers optional log in and signup to guests", () => {
    render(<SiteHeaderView customer={null} />);

    const account = screen.getByRole("navigation", { name: "Account" });
    expect(
      within(account).getByRole("link", { name: "Log in" }),
    ).toHaveAttribute("href", "/login");
    expect(
      within(account).getByRole("link", { name: "Sign up" }),
    ).toHaveAttribute("href", "/signup");
  });

  it("shows My orders and Log out to a signed-in customer", () => {
    render(<SiteHeaderView customer={{ name: "Alice" }} />);

    expect(
      within(screen.getByRole("navigation", { name: "Main" })).getByRole(
        "link",
        { name: "My orders" },
      ),
    ).toHaveAttribute("href", "/my-orders");
    const account = screen.getByRole("navigation", { name: "Account" });
    expect(
      within(account).getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
    expect(
      within(account).queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
  });

  it("marks the current section", () => {
    render(<SiteHeaderView customer={null} currentPath="/barista/history" />);

    expect(screen.getByRole("link", { name: "Barista" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Menu" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
