import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import {
  getOrderStatus,
  updateOrderStatusIfCurrent,
} from "@/lib/db/queries/orders";
import { resolveStatusTransition } from "@/lib/domain/orderStatus";
import {
  OrderIdParamSchema,
  OrderStatusUpdateSchema,
} from "@/lib/schemas/order";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function formatIssues(error: ZodError, prefix?: string): string[] {
  return error.issues.map((issue) => {
    const path = [prefix, ...issue.path].filter(Boolean).join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * PATCH /api/orders/:id/status — barista advances or cancels an order.
 * Body: { action: "advance" | "cancel" }
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const idResult = OrderIdParamSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json(
      { errors: formatIssues(idResult.error, "id") },
      { status: 422 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Invalid JSON payload"] },
      { status: 422 },
    );
  }

  const bodyResult = OrderStatusUpdateSchema.safeParse(body);
  if (!bodyResult.success) {
    return NextResponse.json(
      { errors: formatIssues(bodyResult.error) },
      { status: 422 },
    );
  }

  try {
    const current = await getOrderStatus(idResult.data);
    if (!current) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const transition = resolveStatusTransition(current, bodyResult.data.action);
    if (!transition.ok) {
      return NextResponse.json({ error: transition.error }, { status: 409 });
    }

    const updated = await updateOrderStatusIfCurrent(
      idResult.data,
      transition.from,
      transition.to,
    );
    if (!updated) {
      return NextResponse.json(
        { error: "Order status changed. Refresh and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updated_at: updated.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
