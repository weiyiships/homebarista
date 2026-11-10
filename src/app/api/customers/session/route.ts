import { NextResponse, type NextRequest } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerToken,
  customerCookieOptions,
} from "@/lib/auth/customerSession";
import {
  checkLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/auth/loginRateLimiter";
import { verifyPassword } from "@/lib/auth/password";
import { findCustomerByEmail } from "@/lib/db/queries/customers";
import { LoginSchema, type CustomerResponse } from "@/lib/schemas/customer";

const INVALID_CREDENTIALS = "Invalid email or password";

/**
 * Real bcrypt (cost 12) hash of a random value. Unknown emails are checked
 * against it so a failed login takes the same time either way.
 */
const DUMMY_HASH =
  "$2b$12$Dwbt5PGWc.Vrihvw9lifFOmR3pdZIH3S4g7pCB22eGFD5fcrFtEeu";

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/customers/session — customer login (FR-7, US-11).
 * Body: { email, password }. Failed attempts are rate-limited per email and IP.
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

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        errors: parsed.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;
  const key = { email, ip: clientIp(request) };
  const allowance = checkLoginAllowed(key, Date.now());
  if (!allowance.allowed) {
    const minutes = Math.ceil(allowance.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${minutes} ${
          minutes === 1 ? "minute" : "minutes"
        }.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(allowance.retryAfterSeconds) },
      },
    );
  }

  try {
    const customer = await findCustomerByEmail(email);
    const valid = await verifyPassword(
      password,
      customer?.passwordHash ?? DUMMY_HASH,
    );
    if (!customer || !valid) {
      recordLoginFailure(key, Date.now());
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    clearLoginFailures(email);
    const token = await createCustomerToken(customer);
    const responseBody: CustomerResponse = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
    const response = NextResponse.json(responseBody);
    response.cookies.set(CUSTOMER_COOKIE, token, customerCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not log you in. Please try again." },
      { status: 500 },
    );
  }
}

/** DELETE /api/customers/session — log the customer out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_COOKIE, "", {
    ...customerCookieOptions(),
    maxAge: 0,
  });
  return response;
}
