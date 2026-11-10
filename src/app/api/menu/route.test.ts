// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";

vi.mock("@/lib/db/queries/menu", () => ({
  listMenuItems: vi.fn(),
  listMilkOptions: vi.fn(),
}));

describe("GET /api/menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns every drink with availability and the unavailable milks", async () => {
    vi.mocked(listMenuItems).mockResolvedValueOnce([
      {
        id: "11111111-2222-4333-a444-555555555555",
        name: "Latte",
        available: false,
        takesMilk: true,
        sizeType: "size",
      },
    ]);
    vi.mocked(listMilkOptions).mockResolvedValueOnce([
      {
        id: "22222222-2222-4333-a444-555555555555",
        type: "milk",
        label: "Oat",
        available: false,
      },
      {
        id: "33333333-2222-4333-a444-555555555555",
        type: "milk",
        label: "Whole",
        available: true,
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      drinks: [
        {
          id: "11111111-2222-4333-a444-555555555555",
          name: "Latte",
          available: false,
          takes_milk: true,
          size_type: "size",
        },
      ],
      unavailable_milks: ["Oat"],
    });
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(listMenuItems).mockRejectedValueOnce(new Error("db down"));
    vi.mocked(listMilkOptions).mockResolvedValueOnce([]);

    const response = await GET();

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Failed to load menu");
  });
});
