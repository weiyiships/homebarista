// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH } from "./route";
import {
  listMenuItems,
  listMilkOptions,
  setMenuItemAvailability,
  setMilkAvailability,
} from "@/lib/db/queries/menu";
import { BARISTA_COOKIE, createBaristaToken } from "@/lib/auth/baristaSession";

vi.mock("@/lib/db/queries/menu", () => ({
  listMenuItems: vi.fn(),
  listMilkOptions: vi.fn(),
  setMenuItemAvailability: vi.fn(),
  setMilkAvailability: vi.fn(),
}));

const LATTE_ID = "11111111-2222-4333-a444-555555555555";
const OAT_ID = "22222222-2222-4333-a444-555555555555";
const URL = "http://localhost/api/barista/availability";

function headersFor(token?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("cookie", `${BARISTA_COOKIE}=${token}`);
  return headers;
}

function get(token?: string) {
  return GET(new NextRequest(URL, { headers: headersFor(token) }));
}

function patch(body: unknown, token?: string) {
  return PATCH(
    new NextRequest(URL, {
      method: "PATCH",
      headers: headersFor(token),
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const latte = {
  id: LATTE_ID,
  name: "Latte",
  available: true,
  takesMilk: true,
  sizeType: "size" as const,
};
const espresso = {
  id: "33333333-2222-4333-a444-555555555555",
  name: "Espresso",
  available: false,
  takesMilk: false,
  sizeType: "shots" as const,
};
const oat = {
  id: OAT_ID,
  type: "milk" as const,
  label: "Oat",
  available: true,
};

describe("/api/barista/availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("GET", () => {
    it("returns 401 without a barista session", async () => {
      const response = await get();

      expect(response.status).toBe(401);
      expect(listMenuItems).not.toHaveBeenCalled();
    });

    it("lists every drink and milk with its availability, in menu order", async () => {
      vi.mocked(listMenuItems).mockResolvedValueOnce([latte, espresso]);
      vi.mocked(listMilkOptions).mockResolvedValueOnce([oat]);

      const response = await get(await createBaristaToken());

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({
        drinks: [
          { id: espresso.id, label: "Espresso", available: false },
          { id: LATTE_ID, label: "Latte", available: true },
        ],
        milks: [{ id: OAT_ID, label: "Oat", available: true }],
      });
    });

    it("returns 500 when the database fails", async () => {
      vi.mocked(listMenuItems).mockRejectedValueOnce(new Error("db down"));
      vi.mocked(listMilkOptions).mockResolvedValueOnce([]);

      const response = await get(await createBaristaToken());

      expect(response.status).toBe(500);
      expect((await response.json()).error).toBe("Failed to load availability");
    });
  });

  describe("PATCH", () => {
    it("returns 401 without a barista session", async () => {
      const response = await patch({
        kind: "drink",
        id: LATTE_ID,
        available: false,
      });

      expect(response.status).toBe(401);
      expect(setMenuItemAvailability).not.toHaveBeenCalled();
    });

    it("turns a drink off and returns the updated item", async () => {
      vi.mocked(setMenuItemAvailability).mockResolvedValueOnce({
        ...latte,
        available: false,
      });

      const response = await patch(
        { kind: "drink", id: LATTE_ID, available: false },
        await createBaristaToken(),
      );

      expect(response.status).toBe(200);
      expect(setMenuItemAvailability).toHaveBeenCalledWith(LATTE_ID, false);
      expect(setMilkAvailability).not.toHaveBeenCalled();
      expect(await response.json()).toEqual({
        kind: "drink",
        item: { id: LATTE_ID, label: "Latte", available: false },
      });
    });

    it("turns a milk back on and returns the updated item", async () => {
      vi.mocked(setMilkAvailability).mockResolvedValueOnce(oat);

      const response = await patch(
        { kind: "milk", id: OAT_ID, available: true },
        await createBaristaToken(),
      );

      expect(response.status).toBe(200);
      expect(setMilkAvailability).toHaveBeenCalledWith(OAT_ID, true);
      expect(setMenuItemAvailability).not.toHaveBeenCalled();
      expect(await response.json()).toEqual({
        kind: "milk",
        item: { id: OAT_ID, label: "Oat", available: true },
      });
    });

    it("returns 404 when the item does not exist", async () => {
      vi.mocked(setMilkAvailability).mockResolvedValueOnce(null);

      const response = await patch(
        { kind: "milk", id: OAT_ID, available: false },
        await createBaristaToken(),
      );

      expect(response.status).toBe(404);
      expect((await response.json()).error).toBe("Item not found");
    });

    it.each([
      ["an unknown kind", { kind: "size", id: LATTE_ID, available: false }],
      ["a malformed id", { kind: "drink", id: "latte", available: false }],
      ["a non-boolean flag", { kind: "drink", id: LATTE_ID, available: "no" }],
      ["a missing flag", { kind: "drink", id: LATTE_ID }],
    ])("returns 422 for %s", async (_name, body) => {
      const response = await patch(body, await createBaristaToken());

      expect(response.status).toBe(422);
      expect((await response.json()).errors.length).toBeGreaterThan(0);
      expect(setMenuItemAvailability).not.toHaveBeenCalled();
      expect(setMilkAvailability).not.toHaveBeenCalled();
    });

    it("returns 422 for malformed JSON", async () => {
      const response = await patch("{not json", await createBaristaToken());

      expect(response.status).toBe(422);
    });

    it("returns 500 when the database fails", async () => {
      vi.mocked(setMenuItemAvailability).mockRejectedValueOnce(
        new Error("db down"),
      );

      const response = await patch(
        { kind: "drink", id: LATTE_ID, available: false },
        await createBaristaToken(),
      );

      expect(response.status).toBe(500);
      expect((await response.json()).error).toBe(
        "Failed to update availability",
      );
    });
  });
});
