import { E2E_DATABASE_URL } from "../playwright.config";
import { pushSchema, resetDatabase } from "./support/db";

/** Fresh schema and seed data before the suite runs. */
export default async function globalSetup(): Promise<void> {
  const url = new URL(E2E_DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(url.hostname) && !process.env.CI) {
    throw new Error(
      `Refusing to reset non-local database ${url.hostname}. E2E tests truncate every table.`,
    );
  }
  pushSchema(E2E_DATABASE_URL);
  await resetDatabase(E2E_DATABASE_URL);
}
