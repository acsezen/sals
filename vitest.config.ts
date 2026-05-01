import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@test": path.resolve(__dirname, "test"),
    },
  },
  test: {
    globals: true,
    globalSetup: ["test/globalSetup.ts"],
    environment: "node",
    exclude: ["node_modules", "out", "dist"],
    fileParallelism: false,
    include: ["test/**/*.test.ts"],
    isolate: true,
    setupFiles: ["test/vitestSetup.ts"],
    sequence: {
      concurrent: false,
    },
    testTimeout: 60000,
  },
});
