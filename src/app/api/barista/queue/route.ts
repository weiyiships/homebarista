import { NextResponse, type NextRequest } from "next/server";
import { hasBaristaSession } from "@/lib/auth/baristaSession";
import { listActiveOrders } from "@/lib/db/queries/orders";
import { sortOldestFirst, toQueueOrderDto } from "@/lib/domain/queue";
import type { QueueResponse } from "@/lib/schemas/barista";

/**
 * GET /api/barista/queue — active orders, oldest first (FR-3, US-3).
 * Polled by the barista dashboard; requires a barista session.
 */
export async function GET(request: NextRequest) {
  if (!(await hasBaristaSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listActiveOrders();
    const body: QueueResponse = {
      orders: sortOldestFirst(rows).map(toQueueOrderDto),
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load queue" },
      { status: 500 },
    );
  }
}
