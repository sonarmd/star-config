// @sonarmd/star-config — lint-staged
// Pre-commit hooks: format + lint staged files.
//
// Usage:
//   // .lintstagedrc.cjs
//   module.exports = require("@sonarmd/star-config/lint-staged");

const path = require("path");

// ESLint warns on dotfiles (e.g. .lintstagedrc.cjs) and root config files when
// explicitly passed. Filter those out before running eslint.
function eslintable(files) {
  return files.filter((f) => {
    const base = path.basename(f);
    return !base.startsWith(".") && !/\.config\.(js|cjs|mjs)$/.test(base);
  });
}

module.exports = {
  "*.{ts,tsx}": ["prettier --write", "eslint --max-warnings 0"],
  "*.{js,jsx,mjs,cjs}": (files) => {
    const src = eslintable(files);
    const cmds = [`prettier --write ${files.join(" ")}`];
    if (src.length) cmds.push(`eslint --max-warnings 0 ${src.join(" ")}`);
    return cmds;
  },
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
