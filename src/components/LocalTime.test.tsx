import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocalTime } from "./LocalTime";

describe("LocalTime", () => {
  it("renders the viewer's local date and time with a machine-readable value", () => {
    render(<LocalTime value="2026-11-09T21:30:00.000Z" />);

    const time = screen.getByText(
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date("2026-11-09T21:30:00.000Z")),
    );
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-11-09T21:30:00.000Z");
  });
});
