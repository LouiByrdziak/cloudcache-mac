import { defineConfig } from "tsup";
import git from "git-rev-sync";

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
    // Use Node module resolution
    options.platform = "node";
    options.bundle = true;
    // Explicitly set mainFields to use standard Node resolution
    options.mainFields = ["module", "main"];

    // Define __VERSION__ to be Git commit hash
    options.define = {
      ...options.define,
      __VERSION__: JSON.stringify(git.short()),
    };
  },
});
