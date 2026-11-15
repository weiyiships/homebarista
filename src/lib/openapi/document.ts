import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  type RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { BARISTA_COOKIE } from "@/lib/auth/baristaSession";
import { CUSTOMER_COOKIE } from "@/lib/auth/customerSession";
import {
  AvailabilityResponseSchema,
  AvailabilityUpdateResponseSchema,
  AvailabilityUpdateSchema,
  MenuResponseSchema,
} from "@/lib/schemas/availability";
import {
  BaristaLoginSchema,
  HistoryResponseSchema,
  QueueResponseSchema,
} from "@/lib/schemas/barista";
import {
  CustomerOrdersResponseSchema,
  CustomerResponseSchema,
  LoginSchema,
  SignupSchema,
} from "@/lib/schemas/customer";
import {
  OrderCreatedResponseSchema,
  OrderIdParamSchema,
  OrderRequestSchema,
  OrderStatusUpdateResponseSchema,
  OrderStatusUpdateSchema,
  OrderTrackingSchema,
} from "@/lib/schemas/order";

/**
 * Builds the public API contract from the same Zod schemas the route
 * handlers validate with, so the docs cannot drift from the code.
 * `docs/api/openapi.yaml` is a committed snapshot (`npm run openapi`).
 */

// Error bodies the route handlers return.
const ErrorSchema = z.object({ error: z.string() });
const ValidationErrorSchema = z.object({
  errors: z.array(z.string()),
  field_errors: z.record(z.string(), z.string()).optional(),
});
const OkSchema = z.object({ ok: z.literal(true) });

type Responses = RouteConfig["responses"];

const json = (description: string, schema: z.ZodType) => ({
  description,
  content: { "application/json": { schema } },
});

const body = (schema: z.ZodType) => ({
  body: { required: true, content: { "application/json": { schema } } },
});

const idParam = { params: z.object({ id: OrderIdParamSchema }) };

const validationError = {
  422: json("Invalid JSON or a field failed validation", ValidationErrorSchema),
};
const serverError = { 500: json("Unexpected server error", ErrorSchema) };
const unauthorized = (description: string): Responses => ({
  401: json(description, ErrorSchema),
});

const baristaOnly: Pick<RouteConfig, "security" | "tags"> = {
  security: [{ baristaSession: [] }],
  tags: ["Barista"],
};

function registerPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/menu",
    tags: ["Menu"],
    summary: "Drinks with their availability and the milks that are off",
    responses: { 200: json("The menu", MenuResponseSchema), ...serverError },
  });

  registry.registerPath({
    method: "post",
    path: "/api/orders",
    tags: ["Orders"],
    summary: "Place an order",
    description:
      "Public. If a customer session cookie is present, the order is linked to that account.",
    request: body(OrderRequestSchema),
    responses: {
      201: json("Order placed", OrderCreatedResponseSchema),
      409: json("The drink or chosen milk is unavailable", ErrorSchema),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/orders/{id}",
    tags: ["Orders"],
    summary: "Live status and queue position of one order",
    description: "Public: the unguessable order id is the guest's access key.",
    request: idParam,
    responses: {
      200: json("The order", OrderTrackingSchema),
      404: json("No order with this id", ErrorSchema),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/orders/{id}/status",
    ...baristaOnly,
    summary: "Advance an order to its next status, or cancel it",
    request: { ...idParam, ...body(OrderStatusUpdateSchema) },
    responses: {
      200: json("Status updated", OrderStatusUpdateResponseSchema),
      ...unauthorized("No barista session"),
      404: json("No order with this id", ErrorSchema),
      409: json(
        "The transition is not allowed or the order changed meanwhile",
        ErrorSchema,
      ),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/customers",
    tags: ["Customers"],
    summary: "Sign up",
    description: "Creates the account and sets the customer session cookie.",
    request: body(SignupSchema),
    responses: {
      201: json("Account created", CustomerResponseSchema),
      409: json(
        "An account with this email already exists",
        ErrorSchema.extend({ login_url: z.string() }),
      ),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/customers/session",
    tags: ["Customers"],
    summary: "Log in",
    description:
      "Sets the customer session cookie. Failed attempts are rate-limited per email and IP.",
    request: body(LoginSchema),
    responses: {
      200: json("Logged in", CustomerResponseSchema),
      ...unauthorized("Invalid email or password"),
      429: {
        ...json("Too many failed attempts", ErrorSchema),
        headers: z.object({ "Retry-After": z.string() }),
      },
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/customers/session",
    tags: ["Customers"],
    summary: "Log out",
    responses: { 200: json("Logged out", OkSchema) },
  });

  registry.registerPath({
    method: "get",
    path: "/api/customers/me/orders",
    tags: ["Customers"],
    security: [{ customerSession: [] }],
    summary: "The signed-in customer's past orders",
    responses: {
      200: json("Orders, newest first", CustomerOrdersResponseSchema),
      ...unauthorized("Not logged in"),
      ...serverError,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/barista/session",
    tags: ["Barista"],
    summary: "Sign in with the shared barista passcode",
    request: body(BaristaLoginSchema),
    responses: {
      200: json("Signed in; sets the barista session cookie", OkSchema),
      ...unauthorized("Incorrect passcode"),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/barista/session",
    tags: ["Barista"],
    summary: "Sign out",
    responses: { 200: json("Signed out", OkSchema) },
  });

  registry.registerPath({
    method: "get",
    path: "/api/barista/queue",
    ...baristaOnly,
    summary: "Active orders, oldest first",
    responses: {
      200: json("The queue", QueueResponseSchema),
      ...unauthorized("No barista session"),
      ...serverError,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/barista/availability",
    ...baristaOnly,
    summary: "Every drink and milk with its on/off state",
    responses: {
      200: json("Availability", AvailabilityResponseSchema),
      ...unauthorized("No barista session"),
      ...serverError,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/barista/availability",
    ...baristaOnly,
    summary: "Turn one drink or milk on or off",
    request: body(AvailabilityUpdateSchema),
    responses: {
      200: json("Updated item", AvailabilityUpdateResponseSchema),
      ...unauthorized("No barista session"),
      404: json("No drink or milk with this id", ErrorSchema),
      ...validationError,
      ...serverError,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/barista/history",
    ...baristaOnly,
    summary: "Picked-up and cancelled orders, newest first",
    responses: {
      200: json("Finished orders", HistoryResponseSchema),
      ...unauthorized("No barista session"),
      ...serverError,
    },
  });
}

export function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  registry.registerComponent("securitySchemes", "baristaSession", {
    type: "apiKey",
    in: "cookie",
    name: BARISTA_COOKIE,
    description: "Set by POST /api/barista/session.",
  });
  registry.registerComponent("securitySchemes", "customerSession", {
    type: "apiKey",
    in: "cookie",
    name: CUSTOMER_COOKIE,
    description: "Set by POST /api/customers or POST /api/customers/session.",
  });

  registerPaths(registry);

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Home Barista API",
      version: "1.0.0",
      description:
        "Guests order coffee by QR code; the host runs a live barista queue. All bodies are JSON.",
    },
    tags: [
      { name: "Menu" },
      { name: "Orders" },
      { name: "Customers" },
      { name: "Barista" },
    ],
  });
}
