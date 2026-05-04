import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React 19 introduced new react-hooks rules (set-state-in-effect, immutability,
    // incompatible-library, purity). Existing client components frequently call
    // setState inside effects for data-loading patterns. These are not bugs in
    // the current codebase but the new rules flag them at error severity.
    // Downgrade to `warn` until the React 19 hook patterns get a focused
    // refactor (tracked in LEARNINGS.md issue A2 batch — react-hooks).
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/purity": "warn",
      // exhaustive-deps was already a warning in the old rule set; keep it
      // explicit so config intent is unambiguous.
      "react-hooks/exhaustive-deps": "warn",
      // refs is also in this same family.
      "react-hooks/refs": "warn",
      // preserve-manual-memoization is the React Compiler signaling it
      // skipped optimization; not a runtime bug.
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
