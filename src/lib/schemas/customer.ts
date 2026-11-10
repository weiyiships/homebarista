import { z } from "zod";
import { OrderStatusEnum } from "./order";

/** bcrypt only uses the first 72 bytes of a password. */
const BCRYPT_MAX_BYTES = 72;

export const SignupSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or fewer"),
  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .refine(
      (value) => new TextEncoder().encode(value).length <= BCRYPT_MAX_BYTES,
      "Password is too long",
    ),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const CustomerResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
});

export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;

export const LoginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required")
    .max(1024, "Password is too long"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Customer order history (FR-8, US-12)
// ---------------------------------------------------------------------------

export const CustomerOrderSchema = z.object({
  id: z.string().uuid(),
  drink_name: z.string(),
  status: OrderStatusEnum,
  options: z.object({
    sizing: z.string().nullable(),
    milk: z.string().nullable(),
    temp: z.string().nullable(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/** Response of GET /api/customers/me/orders. */
export const CustomerOrdersResponseSchema = z.object({
  orders: z.array(CustomerOrderSchema),
});

export type CustomerOrderDto = z.infer<typeof CustomerOrderSchema>;
export type CustomerOrdersResponse = z.infer<
  typeof CustomerOrdersResponseSchema
>;
