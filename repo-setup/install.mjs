#!/usr/bin/env node
// @sonarmd/star-config — Repo setup installer
//
// Installs standard repo-level config files for SonarMD projects:
//   - .github/dependabot.yml      (dependency updates)
//   - .github/CODEOWNERS           (workflow ownership)
//   - .github/pull_request_template.md (PR checklist)
//   - .github/SECURITY.md          (responsible disclosure)
//   - .github/release.yml          (auto-generated release notes)
//   - .editorconfig                (editor settings)
//   - .gitattributes               (line endings, binary handling)
//
// Usage:
//   node node_modules/@sonarmd/star-config/repo-setup/install.mjs
//   node node_modules/@sonarmd/star-config/repo-setup/install.mjs --force
//   node node_modules/@sonarmd/star-config/repo-setup/install.mjs --only dependabot,codeowners
//
// Or add to package.json scripts:
//   "setup": "node node_modules/@sonarmd/star-config/repo-setup/install.mjs"

import {execSync} from 'node:child_process';
import {copyFileSync, mkdirSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, 'templates');
const root = execSync('git rev-parse --show-toplevel', {encoding: 'utf-8'}).trim();

const force = process.argv.includes('--force');
const onlyArg = process.argv.find((a) => a.startsWith('--only=') || a.startsWith('--only '));
const onlyFilter = onlyArg
  ? (process.argv[process.argv.indexOf('--only') + 1] || onlyArg.split('=')[1]).split(',')
  : null;

// [id, source template filename, destination relative to repo root]
const files = [
  ['dependabot', 'dependabot.yml', '.github/dependabot.yml'],
  ['codeowners', 'CODEOWNERS', '.github/CODEOWNERS'],
  ['pr-template', 'pull_request_template.md', '.github/pull_request_template.md'],
  ['security', 'SECURITY.md', '.github/SECURITY.md'],
  ['release', 'release.yml', '.github/release.yml'],
  ['editorconfig', 'editorconfig', '.editorconfig'],
  ['gitattributes', 'gitattributes', '.gitattributes'],
];

mkdirSync(join(root, '.github'), {recursive: true});

let installed = 0;
let skipped = 0;

for (const [id, srcFile, destRel] of files) {
  if (onlyFilter && !onlyFilter.includes(id)) continue;

  const src = join(templatesDir, srcFile);
  const dest = join(root, destRel);

  if (existsSync(dest) && !force) {
    console.log(`  skip  ${destRel} (exists — use --force to overwrite)`);
    skipped++;
    continue;
  }

  copyFileSync(src, dest);
  console.log(`  ${existsSync(dest) ? 'update' : 'create'}  ${destRel}`);
  installed++;
}

console.log(`\nstar-config: repo-setup complete (${installed} installed, ${skipped} skipped)`);
