import { NextResponse, type NextRequest } from "next/server";
import { hasBaristaSession } from "@/lib/auth/baristaSession";
import { listFinishedOrders } from "@/lib/db/queries/orders";
import { buildHistory } from "@/lib/domain/history";
import type { HistoryResponse } from "@/lib/schemas/barista";

/**
 * GET /api/barista/history: picked-up and cancelled orders, newest first
 * (FR-6, US-7). Polled by the history tab; requires a barista session.
 */
export async function GET(request: NextRequest) {
  if (!(await hasBaristaSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: HistoryResponse = {
      orders: buildHistory(await listFinishedOrders()),
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 },
    );
  }
}
