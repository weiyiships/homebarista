import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the core flows (AGENTS.md): run against a production
 * build and a real Postgres database, on a 375px phone viewport.
 *
 * Needs E2E_DATABASE_URL pointing at a throwaway database. Its tables are
 * recreated and reseeded before every run.
 */

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:54329/homebarista_e2e";
export const E2E_BARISTA_PASSCODE = "e2e-barista-passcode";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      JWT_SECRET: "e2e-jwt-secret-that-is-at-least-32-characters",
      BARISTA_PASSCODE: E2E_BARISTA_PASSCODE,
    },
  },
});
