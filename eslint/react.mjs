// @sonarmd/star-config — ESLint: React layer
// Optional — enable with starConfig({ react: true }).
// Applied to .tsx and .jsx files.

import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: "star-config/react",
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // JSX transforms (React 17+) — no need for import React
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Safety
      "react/no-danger": "warn",
      "react/no-unstable-nested-components": "warn",
      "react/no-array-index-key": "warn",
      "react/jsx-no-target-blank": ["error", {enforceDynamicLinks: "always"}],
      "react/jsx-no-script-url": "error",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default config;
