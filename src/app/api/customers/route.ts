import { NextResponse, type NextRequest } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerToken,
  customerCookieOptions,
} from "@/lib/auth/customerSession";
import { hashPassword } from "@/lib/auth/password";
import { createCustomer } from "@/lib/db/queries/customers";
import { SignupSchema, type CustomerResponse } from "@/lib/schemas/customer";

/**
 * POST /api/customers — optional customer signup (FR-7, US-10).
 * Body: { name, email, password }. The password is only ever hashed.
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

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return NextResponse.json(
      {
        errors: Object.entries(fieldErrors).map(
          ([field, message]) => `${field}: ${message}`,
        ),
        field_errors: fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const { name, email, password } = parsed.data;
    const result = await createCustomer({
      name,
      email,
      passwordHash: await hashPassword(password),
    });
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
          login_url: "/login",
        },
        { status: 409 },
      );
    }

    const token = await createCustomerToken(result.customer);
    const responseBody: CustomerResponse = result.customer;
    const response = NextResponse.json(responseBody, { status: 201 });
    response.cookies.set(CUSTOMER_COOKIE, token, customerCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }
}
