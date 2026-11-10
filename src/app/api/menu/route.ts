import { NextResponse } from "next/server";
import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";
import { toMenuResponse } from "@/lib/domain/availability";
import type { MenuResponse } from "@/lib/schemas/availability";

export const dynamic = "force-dynamic";

/**
 * GET /api/menu: drinks with their availability and the milks that are off
 * (FR-1, FR-5). Public; polled by the guest menu so toggles show up without
 * a reload.
 */
export async function GET() {
  try {
    const [drinks, milks] = await Promise.all([
      listMenuItems(),
      listMilkOptions(),
    ]);
    const body: MenuResponse = toMenuResponse(drinks, milks);
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
