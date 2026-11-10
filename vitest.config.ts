import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/lib/db/seed.ts"],
      reporter: ["text-summary", "html"],
      // AGENTS.md: 70% overall is the CI floor.
      thresholds: { statements: 70, branches: 70, functions: 70, lines: 70 },
    },
  },
});
