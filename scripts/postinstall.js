#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.env.INIT_CWD || process.cwd();

// Skip when installing inside star-config itself
const pkg = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')); }
  catch { return {}; }
})();
if (pkg.name === '@sonarmd/star-config') process.exit(0);

// Map package name to tag prefix
const SHORT = {
  triggr_api: 'api',
  frontend: 'fe',
  'frontend-patient-app': 'mobile',
  triggr_misc: 'misc',
};
const repoShort = SHORT[pkg.name] || pkg.name;

const srcDir = path.join(__dirname, '..', 'workflows');
const destDir = path.join(root, '.github', 'workflows');

if (!fs.existsSync(srcDir)) process.exit(0);

fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir).filter(f => f.endsWith('.yml'))) {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf8')
    .replace(/__REPO_SHORT__/g, repoShort);
  fs.writeFileSync(path.join(destDir, file), content);
  console.log(`@sonarmd/star-config: .github/workflows/${file} updated`);
}

// ── Inject scripts into consuming repo's package.json ──────────────
const SCRIPTS = {
  'generate:manual-deploy': 'node node_modules/@sonarmd/star-config/scripts/postinstall.js',
  'prepare': 'husky',
};

let pkgDirty = false;
if (!pkg.scripts) pkg.scripts = {};

for (const [name, cmd] of Object.entries(SCRIPTS)) {
  if (pkg.scripts[name] !== cmd) {
    pkg.scripts[name] = cmd;
    pkgDirty = true;
    console.log(`@sonarmd/star-config: set script "${name}"`);
  }
}

if (pkgDirty) {
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  );
}

// ── Install pre-commit hook via husky ──────────────────────────────
const huskyDir = path.join(root, '.husky');
const preCommit = path.join(huskyDir, 'pre-commit');
const hookContent = 'npx lint-staged\n';

fs.mkdirSync(huskyDir, { recursive: true });

if (!fs.existsSync(preCommit) || fs.readFileSync(preCommit, 'utf8') !== hookContent) {
  fs.writeFileSync(preCommit, hookContent, { mode: 0o755 });
  console.log('@sonarmd/star-config: .husky/pre-commit installed');
}

// ── Install lint-staged config if missing ──────────────────────────
const lintStagedRc = path.join(root, '.lintstagedrc.cjs');
const lintStagedContent = 'module.exports = require("@sonarmd/star-config/lint-staged");\n';

if (!fs.existsSync(lintStagedRc)) {
  fs.writeFileSync(lintStagedRc, lintStagedContent);
  console.log('@sonarmd/star-config: .lintstagedrc.cjs created');
}
