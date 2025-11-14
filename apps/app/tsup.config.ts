import { defineConfig } from "tsup";
import { resolve } from "path";
import { readdirSync, statSync } from "fs";

// Helper to find packages in pnpm's .pnpm structure
function findPnpmPackage(packageName: string, rootDir: string): string | null {
  const pnpmDir = resolve(rootDir, "node_modules/.pnpm");
  try {
    const entries = readdirSync(pnpmDir);
    for (const entry of entries) {
      if (entry.startsWith(`${packageName}@`)) {
        const pkgPath = resolve(pnpmDir, entry, "node_modules", packageName);
        if (statSync(pkgPath).isDirectory()) {
          return pkgPath;
        }
      }
    }
  } catch {}
  return null;
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  // Bundle workspace packages but keep external dependencies external
  noExternal: [/^@cloudcache/],
  esbuildOptions(options) {
    const rootDir = resolve(__dirname, "../..");
    // Use Node module resolution (not Yarn PnP)
    options.platform = "node";
    options.bundle = true;
    // Explicitly set mainFields to use standard Node resolution
    options.mainFields = ["module", "main"];

    // Find and alias dependencies of workspace packages (like zod)
    // This helps esbuild resolve packages from pnpm's .pnpm structure
    const dependenciesToResolve = ["zod"]; // Add more as needed
    const aliases: Record<string, string> = {};
    for (const dep of dependenciesToResolve) {
      const depPath = findPnpmPackage(dep, rootDir);
      if (depPath) {
        // Try to find the actual entry point
        const pkgJsonPath = resolve(depPath, "package.json");
        try {
          const pkgJson = require(pkgJsonPath);
          const entry = pkgJson.module || pkgJson.main || "index.js";
          aliases[dep] = resolve(depPath, entry);
        } catch {
          // Fallback to common structure
          aliases[dep] = resolve(depPath, "lib/index.js");
        }
      }
    }
    if (Object.keys(aliases).length > 0) {
      options.alias = { ...options.alias, ...aliases };
    }

    // Alias workspace packages to their source files
    options.alias = {
      ...options.alias,
      "@cloudcache/platform-env": resolve(__dirname, "../../packages/platform-env/src/index.ts"),
      "@cloudcache/platform-logging": resolve(
        __dirname,
        "../../packages/platform-logging/src/index.ts"
      ),
      "@cloudcache/platform-http": resolve(__dirname, "../../packages/platform-http/src/index.ts"),
      "@cloudcache/platform-crypto": resolve(
        __dirname,
        "../../packages/platform-crypto/src/index.ts"
      ),
      "@cloudcache/platform-validate": resolve(
        __dirname,
        "../../packages/platform-validate/src/index.ts"
      ),
    };
  },
});
