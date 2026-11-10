import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BaristaLoginPage from "./page";

describe("/barista/login page", () => {
  it("renders the passcode form", async () => {
    render(
      await BaristaLoginPage({
        searchParams: Promise.resolve({ next: "/barista" }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Barista sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Barista passcode")).toBeInTheDocument();
  });

  it("handles a missing or repeated next parameter", async () => {
    render(
      await BaristaLoginPage({
        searchParams: Promise.resolve({ next: ["/a", "/b"] }),
      }),
    );

    expect(screen.getByLabelText("Barista passcode")).toBeInTheDocument();
  });
});
