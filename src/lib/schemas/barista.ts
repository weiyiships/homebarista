import { z } from "zod";
import { OrderStatusEnum } from "./order";

export const BaristaLoginSchema = z.object({
  passcode: z
    .string({ message: "Passcode is required" })
    .min(1, "Passcode is required")
    .max(128, "Passcode is too long"),
});

export type BaristaLogin = z.infer<typeof BaristaLoginSchema>;

export const QueueOrderOptionsSchema = z.object({
  sizing: z.string().nullable(),
  milk: z.string().nullable(),
  temp: z.string().nullable(),
});

export const QueueOrderSchema = z.object({
  id: z.string().uuid(),
  guest_name: z.string(),
  drink_name: z.string(),
  status: OrderStatusEnum,
  created_at: z.string().datetime(),
  options: QueueOrderOptionsSchema,
});

/** Response of GET /api/barista/queue (FR-3, US-3). */
export const QueueResponseSchema = z.object({
  orders: z.array(QueueOrderSchema),
});

export type QueueOrderDto = z.infer<typeof QueueOrderSchema>;
export type QueueResponse = z.infer<typeof QueueResponseSchema>;
