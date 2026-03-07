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
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-promise-executor-return': 'error',
      'no-throw-literal': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-constant-binary-expression': 'error',
      'no-self-compare': 'error',
      'no-extend-native': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-sequences': 'error',
      'no-constructor-return': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-atomic-updates': 'error',

      // --- Hygiene ---
      'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      'no-console': ['error', {allow: ['error', 'error']}],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'no-shadow': ['error', {builtinGlobals: false, hoist: 'functions'}],
      'no-use-before-define': ['error', {functions: false, classes: true, variables: true}],
      'no-param-reassign': [
        'error',
        {props: true, ignorePropertyModificationsFor: ['acc', 'accumulator', 'draft', 'state']},
      ],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-lone-blocks': 'error',
      'prefer-const': ['error', {destructuring: 'all'}],
      'prefer-template': 'error',
      'consistent-return': 'error',
      eqeqeq: ['error', 'always', {null: 'ignore'}],
      curly: ['error', 'all'],

      // --- Imports ---
      'import/first': 'error',
      'import/export': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-mutable-exports': 'error',
      'import/order': [
        'error',
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
      complexity: ['error', 12],
      'max-depth': ['error', 4],
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', {threshold: 3}],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-jump': 'error',
    },
  },
];

export default config;
