import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderNotFound from "./not-found";

describe("/order/[id] not found", () => {
  it("explains the problem and links back to the menu", () => {
    render(<OrderNotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Order not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to menu/i })).toHaveAttribute(
      "href",
      "/menu",
    );
  });
});
