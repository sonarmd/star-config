// @sonarmd/star-config — lint-staged
// Pre-commit hooks: format + lint staged files.
//
// Usage:
//   // .lintstagedrc.cjs
//   module.exports = require("@sonarmd/star-config/lint-staged");

module.exports = {
  '*.{ts,tsx,js,jsx}': ['prettier --write', 'eslint --no-warn-ignored --max-warnings 0'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
