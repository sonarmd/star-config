// @sonarmd/star-config — ESLint: TypeScript layer
// Adds type-aware rules on top of the JavaScript base.
// Automatically applied to .ts and .tsx files.

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'star-config/typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Type-aware rules require `project: true` — consumers can opt in.
        // We default to syntax-only parsing for zero-config compatibility.
        project: false,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Disable base rules that TS equivalents replace
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-shadow': 'off',
      'no-use-before-define': 'off',

      // TS equivalents
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {functions: false, classes: true, variables: true},
      ],

      // Type safety
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': ['warn', {'ts-ignore': 'allow-with-description'}],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {prefer: 'type-imports', fixStyle: 'inline-type-imports'},
      ],
      // switch-exhaustiveness-check requires project: true (type-aware).
      // Consumers who enable type-aware linting can add it via overrides.

      // Function signatures
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];

export default config;
