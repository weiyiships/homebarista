/**
 * Sliding-window rate limit rules (FR-7: 5 failed logins per 15 minutes).
 * Attempts are millisecond timestamps of failures.
 */

export interface RateLimitPolicy {
  maxAttempts: number;
  windowMs: number;
}

export type RateLimitDecision =
  { limited: false } | { limited: true; retryAfterSeconds: number };

/** Attempts still inside the window at `now`. */
export function pruneAttempts(
  attempts: readonly number[],
  now: number,
  policy: RateLimitPolicy,
): number[] {
  return attempts.filter((at) => now - at < policy.windowMs);
}

export function evaluateRateLimit(
  attempts: readonly number[],
  now: number,
  policy: RateLimitPolicy,
): RateLimitDecision {
  const recent = pruneAttempts(attempts, now, policy).sort((a, b) => a - b);
  if (recent.length < policy.maxAttempts) return { limited: false };

  // Unblocks when enough of the oldest failures have left the window.
  const unblocksAt =
    recent[recent.length - policy.maxAttempts] + policy.windowMs;
  return {
    limited: true,
    retryAfterSeconds: Math.ceil((unblocksAt - now) / 1000),
  };
}
