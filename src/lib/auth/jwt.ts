const MIN_SECRET_LENGTH = 32;

/** HS256 signing key shared by barista and customer sessions. */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters.`,
    );
  }
  return new TextEncoder().encode(secret);
}

/** Cookie flags shared by every session cookie (FR-7). */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
