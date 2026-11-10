import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db/queries/orders";
import { OrderRequestSchema } from "@/lib/schemas/order";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Invalid JSON payload"] },
      { status: 422 },
    );
  }

  const validation = OrderRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        errors: validation.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
        ),
      },
      { status: 422 },
    );
  }

  try {
    const order = await createOrder({
      guestName: validation.data.guest_name,
      drinkId: validation.data.drink_id,
      options: validation.data.options,
      customerId: validation.data.customer_id,
    });

    return NextResponse.json(
      {
        id: order.id,
        order_id: order.id,
        status: order.status,
        guest_name: order.guestName,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
