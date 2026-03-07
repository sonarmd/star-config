// @sonarmd/star-config — ESLint legacy config (.eslintrc format)
// For projects stuck on react-scripts or ESLint < 9.
//
// Usage:
//   // .eslintrc.js
//   module.exports = require("@sonarmd/star-config/eslint/legacy");
//
//   // Or extend in package.json:
//   "eslintConfig": { "extends": ["./node_modules/@sonarmd/star-config/eslint/legacy.cjs"] }

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    // plugin:import/typescript removed — requires eslint-import-resolver-typescript
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: true,
    },
  },
  rules: {
    // --- Safety ---
    eqeqeq: ['error', 'always', {null: 'ignore'}],
    'no-implied-eval': 'error',
    'no-throw-literal': 'error',
    'no-var': 'error',
    'no-debugger': 'error',
    'prefer-const': ['error', {destructuring: 'all'}],

    // --- TypeScript ---
    '@typescript-eslint/no-unused-vars': [
      'error',
      {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-ts-comment': ['error', {'ts-ignore': 'allow-with-description'}],

    // --- Imports (structural only) ---
    'import/first': 'error',
    'import/no-duplicates': 'error',
  },
};
