/** The throwaway database every integration test truncates. */
export function testDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL_TEST;
  if (!raw) {
    throw new Error(
      "DATABASE_URL_TEST is not set. Point it at a throwaway local Postgres (see README › Testing).",
    );
  }
  const { hostname } = new URL(raw);
  if (!["localhost", "127.0.0.1"].includes(hostname) && !process.env.CI) {
    throw new Error(
      `Refusing to use non-local database ${hostname}: integration tests truncate every table.`,
    );
  }
  return raw;
}

export const TEST_JWT_SECRET = "integration-test-secret-at-least-32-chars";
export const TEST_BARISTA_PASSCODE = "integration-passcode";
