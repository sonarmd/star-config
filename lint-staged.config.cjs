// @sonarmd/star-config — lint-staged
// Pre-commit hooks: format + lint staged files.
//
// Usage:
//   // .lintstagedrc.cjs
//   module.exports = require("@sonarmd/star-config/lint-staged");

module.exports = {
  "*.{ts,tsx}": ["prettier --write", "eslint --max-warnings 0"],
  "*.{js,jsx,mjs,cjs}": ["prettier --write", "eslint --max-warnings 0"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
