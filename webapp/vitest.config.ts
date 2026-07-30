import { defineConfig } from "vitest/config";
import path from "path";

// Mirrors tsconfig.json's "@/*": ["./*"] path alias so route files (which use
// "@/lib/..." imports, same as app code) resolve under vitest too, not just tsc.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname) } },
});
