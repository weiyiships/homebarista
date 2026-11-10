import {
  OrderRequestSchema,
  type OrderRequest,
  type OrderStatus,
} from "@/lib/schemas/order";

/**
 * Generates a short, human-readable order ID for guest and barista queue display.
 * Example format: "HB-4X9K"
 */
export function generateOrderId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HB-${suffix}`;
}

/**
 * Returns the default initial status for a newly created order.
 */
export function initialOrderStatus(): OrderStatus {
  return "received";
}

export type OrderValidationResult =
  { success: true; data: OrderRequest } | { success: false; errors: string[] };

/**
 * Validates an order request payload using Zod.
 */
export function validateOrderRequest(input: unknown): OrderValidationResult {
  const result = OrderRequestSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((i) =>
        i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
