import { pushSchema } from "../../../e2e/support/db";
import { testDatabaseUrl } from "./env";

/** Applies the current Drizzle schema once before the suite. */
export default function globalSetup(): void {
  pushSchema(testDatabaseUrl());
}
