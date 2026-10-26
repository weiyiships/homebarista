import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage Component (Issue #1)", () => {
  it("renders the app title and description", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Home Barista" })).toBeDefined();
    expect(screen.getByText(/Order freshly crafted coffee/i)).toBeDefined();
  });

  it("provides accessible navigation links to menu and barista queue", () => {
    render(<HomePage />);
    const orderLink = screen.getByRole("link", { name: /Order Coffee/i });
    const baristaLink = screen.getByRole("link", { name: /Barista Queue/i });

    expect(orderLink.getAttribute("href")).toBe("/menu");
    expect(baristaLink.getAttribute("href")).toBe("/barista/queue");
  });
});
