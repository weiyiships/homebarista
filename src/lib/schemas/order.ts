import { z } from "zod";

// ---------------------------------------------------------------------------
// Order Status enum
// ---------------------------------------------------------------------------

export const OrderStatusEnum = z.enum([
  "received",
  "brewing",
  "ready",
  "picked_up",
  "cancelled",
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const OrderRequestSchema = z.object({
  guest_name: z
    .string({ message: "Guest name is required" })
    .trim()
    .min(1, "Guest name is required"),
  drink_id: z
    .string({ message: "Drink ID is required" })
    .uuid("Invalid drink ID format"),
  options: z.record(z.string(), z.unknown()).default({}),
  customer_id: z.string().uuid("Invalid customer ID").optional().nullable(),
});

export type OrderRequest = z.infer<typeof OrderRequestSchema>;

export const OrderResponseSchema = z.object({
  id: z.string(),
  status: OrderStatusEnum.default("received"),
  guest_name: z.string().optional(),
  drink_id: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().or(z.date()).optional(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

// ---------------------------------------------------------------------------
// Barista status updates (FR-3, US-4)
// ---------------------------------------------------------------------------

export const OrderIdParamSchema = z.string().uuid("Invalid order ID format");

export const OrderStatusUpdateSchema = z.object({
  action: z.enum(["advance", "cancel"], {
    message: "Action must be 'advance' or 'cancel'",
  }),
});

export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
