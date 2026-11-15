import { NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/lib/openapi/document";

export const dynamic = "force-static";

/** GET /api/openapi.json — the OpenAPI 3.1 contract, read by Swagger UI. */
export function GET() {
  return NextResponse.json(buildOpenApiDocument());
}
