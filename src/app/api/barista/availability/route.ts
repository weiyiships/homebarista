import { NextResponse, type NextRequest } from "next/server";
import { hasBaristaSession } from "@/lib/auth/baristaSession";
import {
  listMenuItems,
  listMilkOptions,
  setMenuItemAvailability,
  setMilkAvailability,
} from "@/lib/db/queries/menu";
import { toAvailabilityResponse } from "@/lib/domain/availability";
import {
  AvailabilityUpdateSchema,
  type AvailabilityResponse,
  type AvailabilityUpdateResponse,
} from "@/lib/schemas/availability";

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/**
 * GET /api/barista/availability: every drink and milk with its on/off state
 * (FR-5, US-6). Requires a barista session.
 */
export async function GET(request: NextRequest) {
  if (!(await hasBaristaSession(request))) return unauthorized();

  try {
    const [drinks, milks] = await Promise.all([
      listMenuItems(),
      listMilkOptions(),
    ]);
    const body: AvailabilityResponse = toAvailabilityResponse(drinks, milks);
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/barista/availability: turns one drink or milk on or off.
 * Body: `{ kind: "drink" | "milk", id, available }`.
 */
export async function PATCH(request: NextRequest) {
  if (!(await hasBaristaSession(request))) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Invalid JSON payload"] },
      { status: 422 },
    );
  }

  const validation = AvailabilityUpdateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        errors: validation.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
        ),
      },
      { status: 422 },
    );
  }

  const { kind, id, available } = validation.data;

  try {
    let item: AvailabilityUpdateResponse["item"] | null = null;
    if (kind === "drink") {
      const row = await setMenuItemAvailability(id, available);
      item = row && { id: row.id, label: row.name, available: row.available };
    } else {
      const row = await setMilkAvailability(id, available);
      item = row && { id: row.id, label: row.label, available: row.available };
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const response: AvailabilityUpdateResponse = { kind, item };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 },
    );
  }
}
