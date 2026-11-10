import { z } from "zod";

// ---------------------------------------------------------------------------
// Barista availability panel (FR-5, US-6)
// ---------------------------------------------------------------------------

export const AvailabilityKindEnum = z.enum(["drink", "milk"], {
  message: "Kind must be 'drink' or 'milk'",
});

export type AvailabilityKind = z.infer<typeof AvailabilityKindEnum>;

export const AvailabilityItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  available: z.boolean(),
});

/** Response of GET /api/barista/availability. */
export const AvailabilityResponseSchema = z.object({
  drinks: z.array(AvailabilityItemSchema),
  milks: z.array(AvailabilityItemSchema),
});

/** Body of PATCH /api/barista/availability. */
export const AvailabilityUpdateSchema = z.object({
  kind: AvailabilityKindEnum,
  id: z.string({ message: "Item ID is required" }).uuid("Invalid item ID"),
  available: z.boolean({ message: "Available must be true or false" }),
});

/** Response of PATCH /api/barista/availability. */
export const AvailabilityUpdateResponseSchema = z.object({
  kind: AvailabilityKindEnum,
  item: AvailabilityItemSchema,
});

export type AvailabilityItemDto = z.infer<typeof AvailabilityItemSchema>;
export type AvailabilityResponse = z.infer<typeof AvailabilityResponseSchema>;
export type AvailabilityUpdate = z.infer<typeof AvailabilityUpdateSchema>;
export type AvailabilityUpdateResponse = z.infer<
  typeof AvailabilityUpdateResponseSchema
>;

// ---------------------------------------------------------------------------
// Guest menu (FR-1, FR-5)
// ---------------------------------------------------------------------------

export const MenuDrinkSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  available: z.boolean(),
  takes_milk: z.boolean(),
  size_type: z.enum(["size", "shots"]),
});

/** Response of GET /api/menu, polled by the guest menu. */
export const MenuResponseSchema = z.object({
  drinks: z.array(MenuDrinkSchema),
  unavailable_milks: z.array(z.string()),
});

export type MenuResponse = z.infer<typeof MenuResponseSchema>;
