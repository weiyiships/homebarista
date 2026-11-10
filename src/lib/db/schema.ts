import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const sizeTypeEnum = pgEnum("size_type", ["size", "shots"]);

export const optionTypeEnum = pgEnum("option_type", [
  "size",
  "shots",
  "milk",
  "temp",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "received",
  "brewing",
  "ready",
  "picked_up",
  "cancelled",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  available: boolean("available").notNull().default(true),
  takesMilk: boolean("takes_milk").notNull().default(false),
  sizeType: sizeTypeEnum("size_type").notNull(),
});

export const options = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: optionTypeEnum("type").notNull(),
  label: text("label").notNull(),
  available: boolean("available").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestName: text("guest_name").notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  status: orderStatusEnum("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  optionsJson: jsonb("options_json").notNull().default({}),
});

// ---------------------------------------------------------------------------
// Inferred types (re-exported for use in domain/query layers)
// ---------------------------------------------------------------------------

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
