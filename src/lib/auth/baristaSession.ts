import { jwtVerify, SignJWT } from "jose";
import { getJwtSecret, sessionCookieOptions } from "./jwt";

/**
 * Shared-passcode barista session (FR-3, PRD §9): a signed HS256 JWT in an
 * httpOnly cookie. Uses only Web Crypto so it also runs in Next.js middleware.
 */

export const BARISTA_COOKIE = "hb_barista_session";
export const BARISTA_SESSION_TTL_SECONDS = 60 * 60 * 12;

const AUDIENCE = "barista";
const ROLE = "barista";
async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return new Uint8Array(digest);
}

/**
 * Compares the input with `BARISTA_PASSCODE`. Both sides are hashed first so
 * the comparison is constant-time and does not leak the passcode length.
 */
export async function verifyPasscode(input: string): Promise<boolean> {
  const expected = process.env.BARISTA_PASSCODE ?? "";
  if (expected === "") return false;

  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createBaristaToken(): Promise<string> {
  return new SignJWT({ role: ROLE })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${BARISTA_SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

/** True only for an unexpired, correctly signed barista token. */
export async function verifyBaristaToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    return payload.role === ROLE;
  } catch {
    return false;
  }
}

export function baristaCookieOptions() {
  return sessionCookieOptions(BARISTA_SESSION_TTL_SECONDS);
}

interface CookieSource {
  cookies: { get(name: string): { value: string } | undefined };
}

/** True when the request carries a valid barista session cookie. */
export async function hasBaristaSession(request: CookieSource) {
  return verifyBaristaToken(request.cookies.get(BARISTA_COOKIE)?.value);
}
