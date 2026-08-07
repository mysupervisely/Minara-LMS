import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest configuration for the Milestone 10 testing foundation
 * (docs/milestones/milestone-9-engineering-foundation-development-setup/06-testing-strategy-implementation.md).
 * Tests run against a dedicated test SQLite database (see
 * package.json's "pretest" script and tests/setup.ts), never the local
 * development database — the same never-real-data, never-shared-state
 * discipline as every other non-Production environment
 * (docs/milestones/milestone-9-engineering-foundation-development-setup/03-development-environment-strategy.md).
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    fileParallelism: false, // shared SQLite test database — run test files serially to avoid cross-file interference
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // Next.js's bundler resolves "server-only" to a no-op in
      // server contexts; outside that bundler (i.e. under Vitest),
      // the package's default export throws unconditionally. Alias it
      // to the same empty stub Next.js itself uses, so service modules
      // that import "server-only" (correctly, for application code)
      // remain testable directly.
      "server-only": path.resolve(import.meta.dirname, "./node_modules/server-only/empty.js"),
    },
  },
});
