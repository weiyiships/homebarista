import {
  evaluateRateLimit,
  pruneAttempts,
  type RateLimitPolicy,
} from "@/lib/domain/rateLimit";

/**
 * In-memory store of failed customer logins, keyed by email and by IP.
 * State is per server instance, which fits the PRD's single-instance scale
 * (§8); it resets on restart or cold start.
 */

export const LOGIN_RATE_LIMIT: RateLimitPolicy = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

const MAX_TRACKED_KEYS = 10_000;
const failures = new Map<string, number[]>();

interface LoginKey {
  email: string;
  ip: string;
}

const keysFor = ({ email, ip }: LoginKey) => [`email:${email}`, `ip:${ip}`];

export type LoginAllowance =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkLoginAllowed(key: LoginKey, now: number): LoginAllowance {
  let retryAfterSeconds = 0;
  for (const k of keysFor(key)) {
    const decision = evaluateRateLimit(
      failures.get(k) ?? [],
      now,
      LOGIN_RATE_LIMIT,
    );
    if (decision.limited) {
      retryAfterSeconds = Math.max(
        retryAfterSeconds,
        decision.retryAfterSeconds,
      );
    }
  }
  return retryAfterSeconds > 0
    ? { allowed: false, retryAfterSeconds }
    : { allowed: true };
}

export function recordLoginFailure(key: LoginKey, now: number): void {
  for (const k of keysFor(key)) {
    const recent = pruneAttempts(failures.get(k) ?? [], now, LOGIN_RATE_LIMIT);
    recent.push(now);
    failures.delete(k);
    failures.set(k, recent);
  }
  // Bound memory: drop the least recently failed keys.
  while (failures.size > MAX_TRACKED_KEYS) {
    const oldest = failures.keys().next().value;
    if (oldest === undefined) break;
    failures.delete(oldest);
  }
}

/** Forget an email's failures after it logs in successfully. */
export function clearLoginFailures(email: string): void {
  failures.delete(`email:${email}`);
}

/** Test helper. */
export function resetLoginRateLimiter(): void {
  failures.clear();
}
