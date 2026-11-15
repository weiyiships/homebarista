// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { buildOpenApiDocument } from "./document";

const API_DIR = path.join(process.cwd(), "src/app/api");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

/** Routes that serve the docs themselves and are not part of the contract. */
const DOC_ROUTES = new Set(["/api/openapi.json"]);

function findRouteFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return findRouteFiles(full);
    return entry === "route.ts" ? [full] : [];
  });
}

/** Every `METHOD /api/path` exported by a route handler, in OpenAPI form. */
function implementedOperations(): string[] {
  return findRouteFiles(API_DIR).flatMap((file) => {
    const route =
      "/api/" +
      path
        .relative(API_DIR, path.dirname(file))
        .split(path.sep)
        .map((segment) => segment.replace(/^\[(.+)\]$/, "{$1}"))
        .join("/");
    if (DOC_ROUTES.has(route)) return [];
    const source = readFileSync(file, "utf8");
    return METHODS.filter((method) =>
      new RegExp(`export async function ${method}\\b`).test(source),
    ).map((method) => `${method} ${route}`);
  });
}

function documentedOperations(): string[] {
  const doc = buildOpenApiDocument();
  return Object.entries(doc.paths ?? {}).flatMap(([route, item]) =>
    METHODS.filter((method) => method.toLowerCase() in (item ?? {})).map(
      (method) => `${method} ${route}`,
    ),
  );
}

function operation(route: string, method: string) {
  const item = buildOpenApiDocument().paths?.[route] as
    | Record<string, { security?: Record<string, string[]>[] } | undefined>
    | undefined;
  return item?.[method.toLowerCase()];
}

describe("buildOpenApiDocument", () => {
  it("is an OpenAPI 3.1 document", () => {
    const doc = buildOpenApiDocument();
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info.title).toBe("Home Barista API");
  });

  it("documents every route handler, and nothing that does not exist", () => {
    expect(documentedOperations().sort()).toEqual(
      implementedOperations().sort(),
    );
  });

  it("requires the barista cookie on barista-only operations", () => {
    const baristaOnly = [
      ["/api/barista/queue", "GET"],
      ["/api/barista/history", "GET"],
      ["/api/barista/availability", "GET"],
      ["/api/barista/availability", "PATCH"],
      ["/api/orders/{id}/status", "PATCH"],
    ] as const;
    for (const [route, method] of baristaOnly) {
      expect(operation(route, method)?.security, `${method} ${route}`).toEqual([
        { baristaSession: [] },
      ]);
    }
  });

  it("requires the customer cookie for the customer's order history", () => {
    expect(operation("/api/customers/me/orders", "GET")?.security).toEqual([
      { customerSession: [] },
    ]);
  });

  it("leaves public operations without a security requirement", () => {
    expect(operation("/api/menu", "GET")?.security).toBeUndefined();
    expect(operation("/api/orders", "POST")?.security).toBeUndefined();
  });

  it("is in sync with the committed docs/api/openapi.yaml", () => {
    const committed: unknown = parse(
      readFileSync(path.join(process.cwd(), "docs/api/openapi.yaml"), "utf8"),
    );
    // Round-trip through JSON so `undefined` fields compare like YAML does.
    expect(committed).toEqual(
      JSON.parse(JSON.stringify(buildOpenApiDocument())),
    );
  });
});
