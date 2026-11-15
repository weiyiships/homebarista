import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiDocs } from "./ApiDocs";

vi.mock("swagger-ui-react", () => ({
  default: ({ url }: { url: string }) => <div data-testid="swagger">{url}</div>,
}));

describe("ApiDocs", () => {
  it("points Swagger UI at the generated spec", async () => {
    render(<ApiDocs />);
    expect(await screen.findByTestId("swagger")).toHaveTextContent(
      "/api/openapi.json",
    );
  });

  it("has a page heading", () => {
    render(<ApiDocs />);
    expect(
      screen.getByRole("heading", { level: 1, name: /api reference/i }),
    ).toBeInTheDocument();
  });
});
