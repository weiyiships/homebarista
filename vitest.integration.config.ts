import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Route handlers against a real Postgres (`DATABASE_URL_TEST`).
 * Every test truncates the tables, so files run one at a time.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["./tests/integration/support/global-setup.ts"],
    setupFiles: ["./tests/integration/support/setup.ts"],
    fileParallelism: false,
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      // Route handlers only; the `catch` → 500 branches need a failing
      // database and are covered by the mocked unit tests next to each route.
      include: ["src/app/api/**/route.ts"],
      exclude: ["src/app/api/openapi.json/**"],
      reporter: ["text-summary"],
      // AGENTS.md: 85% for route handlers.
      thresholds: { statements: 85, branches: 85, functions: 85, lines: 85 },
    },
  },
});
