// @sonarmd/star-config — ESLint: SonarJS layer
// Always-on. Enforces code quality and complexity rules across all SonarMD repos.

import sonarjs from 'eslint-plugin-sonarjs';

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'star-config/sonar',
    plugins: {sonarjs},
    rules: {
      // --- Complexity ---
      'sonarjs/cognitive-complexity': ['error', 15],

      // --- Duplicates & dead code ---
      'sonarjs/no-duplicate-string': ['error', {threshold: 3}],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-unused-collection': 'error',

      // --- Redundant / collapsible code ---
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',

      // --- Bugs and logic errors ---
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-gratuitous-expressions': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-same-line-conditional': 'error',

      // --- Style (warn — surfaced but not blocking) ---
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'sonarjs/prefer-while': 'error',
    },
  },
];

export default config;
