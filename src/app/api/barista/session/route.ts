import { NextResponse, type NextRequest } from "next/server";
import {
  BARISTA_COOKIE,
  baristaCookieOptions,
  createBaristaToken,
  verifyPasscode,
} from "@/lib/auth/baristaSession";
import { BaristaLoginSchema } from "@/lib/schemas/barista";

/**
 * POST /api/barista/session — exchange the shared passcode for a session cookie.
 * Body: { passcode: string }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Invalid JSON payload"] },
      { status: 422 },
    );
  }

  const parsed = BaristaLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        errors: parsed.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
        ),
      },
      { status: 422 },
    );
  }

  if (!(await verifyPasscode(parsed.data.passcode))) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createBaristaToken();
  } catch {
    return NextResponse.json(
      { error: "Barista login is not configured" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(BARISTA_COOKIE, token, baristaCookieOptions());
  return response;
}

/** DELETE /api/barista/session — log the barista out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(BARISTA_COOKIE, "", {
    ...baristaCookieOptions(),
    maxAge: 0,
  });
  return response;
}
