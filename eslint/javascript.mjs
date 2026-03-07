// @sonarmd/star-config — ESLint: JavaScript base layer
// Core hygiene, safety, import ordering, and complexity controls.

import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'star-config/javascript',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    plugins: {
      import: importPlugin,
      sonarjs,
    },
    rules: {
      ...js.configs.recommended.rules,

      // --- Safety ---
      'no-undef': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // no-return-await removed — deprecated in ESLint 9
      'no-promise-executor-return': 'error',
      'no-throw-literal': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-constant-binary-expression': 'error',
      'no-self-compare': 'error',

      // --- Hygiene ---
      'no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      'no-console': ['warn', {allow: ['warn', 'error']}],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'no-shadow': ['error', {builtinGlobals: false, hoist: 'functions'}],
      'no-use-before-define': ['error', {functions: false, classes: true, variables: true}],
      'no-param-reassign': [
        'warn',
        {props: true, ignorePropertyModificationsFor: ['acc', 'accumulator', 'draft', 'state']},
      ],
      'prefer-const': ['error', {destructuring: 'all'}],
      'prefer-template': 'warn',
      'consistent-return': 'warn',
      eqeqeq: ['error', 'always', {null: 'ignore'}],
      curly: ['error', 'all'],

      // --- Imports ---
      'import/first': 'error',
      'import/export': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'warn',
      'import/no-mutable-exports': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {order: 'asc', caseInsensitive: true},
          'newlines-between': 'always',
        },
      ],

      // --- Complexity ---
      complexity: ['warn', 15],
      'max-depth': ['warn', 5],
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-duplicate-string': ['warn', {threshold: 3}],
      'sonarjs/no-identical-functions': 'warn',
    },
  },
];

export default config;
