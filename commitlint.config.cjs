// @sonarmd/star-config — Commitlint
// Enforces Conventional Commits (feat:, fix:, chore:, etc.)
//
// Usage:
//   // commitlint.config.cjs
//   module.exports = require("@sonarmd/star-config/commitlint");

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0, 'always', Infinity],
  },
};
