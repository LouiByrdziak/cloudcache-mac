import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    // Applies to all files
    ignores: ["dist/", "node_modules/"],
  },
  {
    // TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.worker,
        ...globals.es2022,
      },
    },
    rules: {
      // Add any custom rules here
    },
  }
);
