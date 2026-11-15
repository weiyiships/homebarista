"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Swagger UI touches `window`, so it only renders in the browser.
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export const SPEC_URL = "/api/openapi.json";

export function ApiDocs() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        API reference
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        OpenAPI 3.1, generated from the Zod schemas the server validates with.
        Raw spec:{" "}
        <a
          className="font-medium text-[var(--primary)] underline"
          href={SPEC_URL}
        >
          {SPEC_URL}
        </a>
      </p>
      {/* Swagger UI ships its own light theme; keep it on a light surface. */}
      <div className="mt-6 rounded-[12px] border border-[var(--border)] bg-white">
        <SwaggerUI url={SPEC_URL} docExpansion="list" />
      </div>
    </main>
  );
}
