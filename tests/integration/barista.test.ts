import { describe, expect, it } from "vitest";
import {
  DELETE as baristaLogout,
  POST as baristaLogin,
} from "@/app/api/barista/session/route";
import { GET as queue } from "@/app/api/barista/queue/route";
import { GET as history } from "@/app/api/barista/history/route";
import {
  GET as availability,
  PATCH as setAvailability,
} from "@/app/api/barista/availability/route";
import { GET as menu } from "@/app/api/menu/route";
import { POST as placeOrder } from "@/app/api/orders/route";
import { PATCH as updateStatus } from "@/app/api/orders/[id]/status/route";
import {
  baristaCookie,
  drinkId,
  milkId,
  params,
  request,
} from "./support/http";

async function placeFor(guest: string): Promise<string> {
  const response = await placeOrder(
    request("/api/orders", {
      body: { guest_name: guest, drink_id: await drinkId("Americano") },
    }),
  );
  return ((await response.json()) as { id: string }).id;
}

async function act(id: string, cookie: string, action: "advance" | "cancel") {
  await updateStatus(
    request(`/api/orders/${id}/status`, {
      method: "PATCH",
      cookie,
      body: { action },
    }),
    params(id),
  );
}

describe("barista session", () => {
  it("accepts the passcode and rejects a wrong or missing one", async () => {
    expect(await baristaCookie()).toMatch(/^hb_barista_session=.+/);
    const wrong = await baristaLogin(
      request("/api/barista/session", { body: { passcode: "nope" } }),
    );
    expect(wrong.status).toBe(401);
    expect(
      (await baristaLogin(request("/api/barista/session", { body: {} })))
        .status,
    ).toBe(422);
    expect(
      (
        await baristaLogin(
          request("/api/barista/session", { method: "POST", raw: "{" }),
        )
      ).status,
    ).toBe(422);
  });

  it("rejects a body that is not an object with 422", async () => {
    const response = await baristaLogin(
      request("/api/barista/session", { method: "POST", raw: "null" }),
    );
    expect(response.status).toBe(422);
  });

  it("logs out by expiring the cookie", async () => {
    expect((await baristaLogout()).headers.get("set-cookie")).toMatch(
      /Max-Age=0/i,
    );
  });
});

describe("barista-only routes", () => {
  it("return 401 without a barista session, even with a forged cookie", async () => {
    const forged = "hb_barista_session=forged";
    for (const cookie of [undefined, forged]) {
      expect(
        (await queue(request("/api/barista/queue", { cookie }))).status,
      ).toBe(401);
      expect(
        (await history(request("/api/barista/history", { cookie }))).status,
      ).toBe(401);
      expect(
        (await availability(request("/api/barista/availability", { cookie })))
          .status,
      ).toBe(401);
      expect(
        (
          await setAvailability(
            request("/api/barista/availability", {
              method: "PATCH",
              cookie,
              body: {},
            }),
          )
        ).status,
      ).toBe(401);
    }
  });
});

describe("GET /api/barista/queue and /history", () => {
  it("lists active orders oldest first and finished orders in history", async () => {
    const cookie = await baristaCookie();
    const first = await placeFor("First");
    const second = await placeFor("Second");
    const third = await placeFor("Third");
    await act(first, cookie, "advance");
    await act(third, cookie, "cancel");

    const active = await (
      await queue(request("/api/barista/queue", { cookie }))
    ).json();
    expect(
      active.orders.map((o: { guest_name: string }) => o.guest_name),
    ).toEqual(["First", "Second"]);
    expect(active.orders[0].status).toBe("brewing");

    const done = await (
      await history(request("/api/barista/history", { cookie }))
    ).json();
    expect(done.orders).toHaveLength(1);
    expect(done.orders[0]).toMatchObject({ id: third, status: "cancelled" });
    expect(second).toBeTruthy();
  });
});

describe("/api/barista/availability and /api/menu", () => {
  it("turns a drink and a milk off and the guest menu reflects it", async () => {
    const cookie = await baristaCookie();
    const latte = await drinkId("Latte");

    const drink = await setAvailability(
      request("/api/barista/availability", {
        method: "PATCH",
        cookie,
        body: { kind: "drink", id: latte, available: false },
      }),
    );
    expect(await drink.json()).toEqual({
      kind: "drink",
      item: { id: latte, label: "Latte", available: false },
    });
    await setAvailability(
      request("/api/barista/availability", {
        method: "PATCH",
        cookie,
        body: { kind: "milk", id: await milkId("Almond"), available: false },
      }),
    );

    const panel = await (
      await availability(request("/api/barista/availability", { cookie }))
    ).json();
    expect(panel.drinks).toHaveLength(6);
    expect(
      panel.milks.find((m: { label: string }) => m.label === "Almond")
        .available,
    ).toBe(false);

    const guestMenu = await (await menu()).json();
    expect(guestMenu.unavailable_milks).toEqual(["Almond"]);
    expect(
      guestMenu.drinks.find((d: { id: string }) => d.id === latte).available,
    ).toBe(false);
  });

  it("returns 404 for an unknown item and 422 for a bad body", async () => {
    const cookie = await baristaCookie();
    const patch = (body: unknown, raw?: string) =>
      setAvailability(
        request("/api/barista/availability", {
          method: "PATCH",
          cookie,
          body,
          raw,
        }),
      );
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(
      (await patch({ kind: "drink", id: missing, available: true })).status,
    ).toBe(404);
    expect(
      (await patch({ kind: "milk", id: missing, available: true })).status,
    ).toBe(404);
    expect(
      (await patch({ kind: "syrup", id: missing, available: true })).status,
    ).toBe(422);
    expect((await patch(undefined, "{")).status).toBe(422);
    expect((await patch(undefined, "null")).status).toBe(422);
  });
});
