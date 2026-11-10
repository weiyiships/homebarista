import { jwtVerify, SignJWT } from "jose";
import { getJwtSecret, sessionCookieOptions } from "./jwt";

/**
 * Customer session (FR-7): a signed HS256 JWT in an httpOnly cookie that
 * expires after 7 days. Uses its own audience so a customer token can never
 * pass as a barista token, and vice versa.
 */

export const CUSTOMER_COOKIE = "hb_customer_session";
export const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const AUDIENCE = "customer";
const ROLE = "customer";

export interface CustomerSession {
  id: string;
  name: string;
}

export async function createCustomerToken(
  customer: CustomerSession,
): Promise<string> {
  return new SignJWT({ role: ROLE, name: customer.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(customer.id)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${CUSTOMER_SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

/** The signed-in customer, or null for a missing or invalid token. */
export async function verifyCustomerToken(
  token: string | undefined,
): Promise<CustomerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (
      payload.role !== ROLE ||
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return { id: payload.sub, name: payload.name };
  } catch {
    return null;
  }
}

export function customerCookieOptions() {
  return sessionCookieOptions(CUSTOMER_SESSION_TTL_SECONDS);
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** The signed-in customer for a route handler request, or null. */
export async function getCustomerFromRequest(
  request: Request,
): Promise<CustomerSession | null> {
  return verifyCustomerToken(
    readCookie(request.headers.get("cookie"), CUSTOMER_COOKIE),
  );
}
