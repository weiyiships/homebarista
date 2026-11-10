import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("is the content info landmark with site links", () => {
    render(<SiteFooter />);

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(/Home Barista/)).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
    expect(
      within(footer).getByRole("link", { name: "Barista queue" }),
    ).toHaveAttribute("href", "/barista");
  });
});
