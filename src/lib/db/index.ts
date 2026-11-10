import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Returns a Drizzle db client connected to DATABASE_URL.
 *
 * The client is created lazily at first call so that importing this module
 * does NOT fail when DATABASE_URL is unset (e.g. during unit tests or build
 * time). Attempting to actually query the DB without the env var set will
 * throw a clear error.
 */
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Copy .env.example to .env.local and add your Postgres connection string.",
    );
  }
  const client = postgres(url, { max: 1 });
  return drizzle(client, { schema });
}

// Module-level singleton — created on first access.
let _db: ReturnType<typeof createDb> | undefined;

export function getDb(): ReturnType<typeof createDb> {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

/**
 * Convenience export.  Route handlers and query helpers should import `db`
 * directly; the lazy wrapper means top-level `import { db }` is safe even
 * when DATABASE_URL is absent.
 */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDb>];
  },
});
