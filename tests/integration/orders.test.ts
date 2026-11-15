import { describe, expect, it } from "vitest";
import { POST as placeOrder } from "@/app/api/orders/route";
import { GET as trackOrder } from "@/app/api/orders/[id]/route";
import { PATCH as updateStatus } from "@/app/api/orders/[id]/status/route";
import { PATCH as setAvailability } from "@/app/api/barista/availability/route";
import {
  baristaCookie,
  customerCookie,
  drinkId,
  milkId,
  params,
  request,
} from "./support/http";

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

async function order(guest: string, drink = "Latte", cookie?: string) {
  const response = await placeOrder(
    request("/api/orders", {
      cookie,
      body: {
        guest_name: guest,
        drink_id: await drinkId(drink),
        options: { temp: "Hot", sizing: "Small", milk: "Oat" },
      },
    }),
  );
  return { response, body: (await response.json()) as { id: string } };
}

async function advance(id: string, cookie: string, action = "advance") {
  return updateStatus(
    request(`/api/orders/${id}/status`, {
      method: "PATCH",
      cookie,
      body: { action },
    }),
    params(id),
  );
}

describe("POST /api/orders", () => {
  it("stores the order as received and returns its id", async () => {
    const { response, body } = await order("  Grace  ");
    expect(response.status).toBe(201);
    expect(body).toMatchObject({ status: "received", guest_name: "Grace" });

    const tracked = await trackOrder(
      request(`/api/orders/${body.id}`),
      params(body.id),
    );
    expect(await tracked.json()).toMatchObject({
      id: body.id,
      drink_name: "Latte",
      status: "received",
      options: { milk: "Oat" },
      orders_ahead: 0,
    });
  });

  it("rejects invalid JSON and invalid fields with 422", async () => {
    const badJson = await placeOrder(
      request("/api/orders", { method: "POST", raw: "{" }),
    );
    expect(badJson.status).toBe(422);

    const badFields = await placeOrder(
      request("/api/orders", { body: { guest_name: "", drink_id: "nope" } }),
    );
    expect(badFields.status).toBe(422);
    expect((await badFields.json()).errors).toHaveLength(2);
  });

  it("rejects a body that is not an object with 422", async () => {
    const response = await placeOrder(
      request("/api/orders", { method: "POST", raw: "null" }),
    );
    expect(response.status).toBe(422);
    expect((await response.json()).errors).toHaveLength(1);
  });

  it("rejects an unknown drink with 422", async () => {
    const response = await placeOrder(
      request("/api/orders", {
        body: { guest_name: "Grace", drink_id: MISSING_ID },
      }),
    );
    expect(response.status).toBe(422);
  });

  it("refuses a drink or milk the barista turned off with 409", async () => {
    const barista = await baristaCookie();
    await setAvailability(
      request("/api/barista/availability", {
        method: "PATCH",
        cookie: barista,
        body: { kind: "milk", id: await milkId("Oat"), available: false },
      }),
    );
    expect((await order("Grace")).response.status).toBe(409);

    await setAvailability(
      request("/api/barista/availability", {
        method: "PATCH",
        cookie: barista,
        body: {
          kind: "drink",
          id: await drinkId("Espresso"),
          available: false,
        },
      }),
    );
    expect((await order("Grace", "Espresso")).response.status).toBe(409);
  });

  it("links the order to the signed-in customer", async () => {
    const { GET: myOrders } =
      await import("@/app/api/customers/me/orders/route");
    const cookie = await customerCookie();
    await order("Ada", "Mocha", cookie);
    await order("Someone else");

    const response = await myOrders(
      request("/api/customers/me/orders", { cookie }),
    );
    const body = (await response.json()) as {
      orders: { drink_name: string }[];
    };
    expect(body.orders.map((o) => o.drink_name)).toEqual(["Mocha"]);
  });
});

describe("GET /api/orders/{id}", () => {
  it("counts the received orders ahead in the queue", async () => {
    await order("First");
    const { body } = await order("Second");
    const response = await trackOrder(
      request(`/api/orders/${body.id}`),
      params(body.id),
    );
    expect((await response.json()).orders_ahead).toBe(1);
  });

  it("returns 404 for an unknown id and 422 for a malformed one", async () => {
    expect((await trackOrder(request("/x"), params(MISSING_ID))).status).toBe(
      404,
    );
    expect((await trackOrder(request("/x"), params("not-a-uuid"))).status).toBe(
      422,
    );
  });
});

describe("PATCH /api/orders/{id}/status", () => {
  it("walks an order received → brewing → ready → picked_up", async () => {
    const cookie = await baristaCookie();
    const { body } = await order("Grace");

    for (const expected of ["brewing", "ready", "picked_up"]) {
      const response = await advance(body.id, cookie);
      expect(response.status).toBe(200);
      expect((await response.json()).status).toBe(expected);
    }

    // A picked-up order cannot move again.
    expect((await advance(body.id, cookie)).status).toBe(409);
  });

  it("cancels an order and refuses to cancel it twice", async () => {
    const cookie = await baristaCookie();
    const { body } = await order("Grace");
    const cancelled = await advance(body.id, cookie, "cancel");
    expect((await cancelled.json()).status).toBe("cancelled");
    expect((await advance(body.id, cookie, "cancel")).status).toBe(409);
  });

  it("validates the id, the body, and that the order exists", async () => {
    const cookie = await baristaCookie();
    expect((await advance("not-a-uuid", cookie)).status).toBe(422);
    expect((await advance(MISSING_ID, cookie)).status).toBe(404);

    const { body } = await order("Grace");
    expect((await advance(body.id, cookie, "teleport")).status).toBe(422);
    const badJson = await updateStatus(
      request(`/api/orders/${body.id}/status`, {
        method: "PATCH",
        cookie,
        raw: "{",
      }),
      params(body.id),
    );
    expect(badJson.status).toBe(422);
  });
});
