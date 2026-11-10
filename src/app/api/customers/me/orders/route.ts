import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/auth/customerSession";
import { listOrdersForCustomer } from "@/lib/db/queries/orders";
import { buildCustomerOrders } from "@/lib/domain/customerOrders";
import type { CustomerOrdersResponse } from "@/lib/schemas/customer";

/**
 * GET /api/customers/me/orders — the signed-in customer's order history
 * (FR-8, US-12). The customer comes only from the session cookie; there is
 * no id parameter, so no request can name another customer.
 */
export async function GET(request: Request) {
  const customer = await getCustomerFromRequest(request);
  if (!customer) {
    return NextResponse.json(
      { error: "Log in to see your orders" },
      { status: 401 },
    );
  }

  try {
    const rows = await listOrdersForCustomer(customer.id);
    const body: CustomerOrdersResponse = { orders: buildCustomerOrders(rows) };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load your orders" },
      { status: 500 },
    );
  }
}
