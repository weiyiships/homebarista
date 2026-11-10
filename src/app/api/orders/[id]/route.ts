import { NextResponse } from "next/server";
import { getOrderTracking } from "@/lib/db/queries/tracking";
import { OrderIdParamSchema } from "@/lib/schemas/order";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/:id — live status for the guest status page (FR-4, US-5).
 * Public by design: the unguessable order id is the guest's access key.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const idResult = OrderIdParamSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json(
      { errors: idResult.error.issues.map((i) => `id: ${i.message}`) },
      { status: 422 },
    );
  }

  try {
    const tracking = await getOrderTracking(idResult.data);
    if (!tracking) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(tracking, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 },
    );
  }
}
