import { beforeEach } from "vitest";
import { resetLoginRateLimiter } from "@/lib/auth/loginRateLimiter";
import { resetDatabase } from "../../../e2e/support/db";
import { TEST_BARISTA_PASSCODE, TEST_JWT_SECRET, testDatabaseUrl } from "./env";

// Route handlers read these through lib/db and lib/auth.
process.env.DATABASE_URL = testDatabaseUrl();
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.BARISTA_PASSCODE = TEST_BARISTA_PASSCODE;

beforeEach(async () => {
  await resetDatabase(testDatabaseUrl());
  resetLoginRateLimiter();
});
