// @sonarmd/star-config — ESLint flat config entry point
//
// Usage in consumer repos:
//
//   // eslint.config.mjs
//   import starConfig from "@sonarmd/star-config/eslint";
//   export default starConfig({ typescript: true, react: true });
//
// All layers are composable. TypeScript is on by default, React is opt-in.

import eslintConfigPrettier from "eslint-config-prettier";

import jsConfig from "./javascript.mjs";
import reactConfig from "./react.mjs";
import tsConfig from "./typescript.mjs";

/**
 * Build the flat ESLint config array for a project.
 *
 * @param {Object} [options]
 * @param {boolean} [options.typescript=true]  Include TypeScript rules.
 * @param {boolean} [options.react=false]      Include React/hooks rules.
 * @param {import("eslint").Linter.Config[]} [options.overrides=[]] Additional config objects.
 * @returns {import("eslint").Linter.Config[]}
 */
export default function starConfig(options = {}) {
  const {typescript = true, react = false, overrides = []} = options;

  return [
    ...jsConfig,
    ...(typescript ? tsConfig : []),
    ...(react ? reactConfig : []),
    // Prettier must be last — disables formatting rules that conflict.
    eslintConfigPrettier,
    ...overrides,
  ];
}
