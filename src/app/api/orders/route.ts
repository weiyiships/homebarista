import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/auth/customerSession";
import { getMenuItemById, listMilkOptions } from "@/lib/db/queries/menu";
import { createOrder } from "@/lib/db/queries/orders";
import { checkOrderAvailability } from "@/lib/domain/availability";
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
    // Re-check availability on the server so a stale, already-open menu
    // cannot order something the barista turned off (FR-5).
    // The account comes only from the session cookie, never the body (FR-7).
    const [drink, milks, customer] = await Promise.all([
      getMenuItemById(validation.data.drink_id),
      listMilkOptions(),
      getCustomerFromRequest(request),
    ]);
    const availability = checkOrderAvailability(
      drink,
      validation.data.options,
      milks,
    );
    if (!availability.ok) {
      return availability.reason === "drink_not_found"
        ? NextResponse.json({ errors: [availability.message] }, { status: 422 })
        : NextResponse.json({ error: availability.message }, { status: 409 });
    }

    const order = await createOrder({
      guestName: validation.data.guest_name,
      drinkId: validation.data.drink_id,
      options: validation.data.options,
      customerId: customer?.id ?? null,
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
