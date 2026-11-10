import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaristaNav } from "./BaristaNav";

describe("BaristaNav", () => {
  it("links to the queue, the history, and availability", () => {
    render(<BaristaNav current="queue" />);

    const nav = screen.getByRole("navigation", { name: "Barista" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Queue" })).toHaveAttribute(
      "href",
      "/barista",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/barista/history",
    );
    expect(screen.getByRole("link", { name: "Availability" })).toHaveAttribute(
      "href",
      "/barista/availability",
    );
  });

  it("marks the availability tab as current", () => {
    render(<BaristaNav current="availability" />);

    expect(screen.getByRole("link", { name: "Availability" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Queue" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the queue tab as current", () => {
    render(<BaristaNav current="queue" />);

    expect(screen.getByRole("link", { name: "Queue" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "History" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the history tab as current", () => {
    render(<BaristaNav current="history" />);

    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Queue" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
