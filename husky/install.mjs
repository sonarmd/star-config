#!/usr/bin/env node
// @sonarmd/star-config — Husky hook installer
//
// Consumers call this once to set up git hooks:
//   node node_modules/@sonarmd/star-config/husky/install.mjs
//
// Or add to package.json:
//   "scripts": { "prepare": "node node_modules/@sonarmd/star-config/husky/install.mjs" }
//
// Creates .husky/ with pre-commit (lint-staged) and commit-msg (commitlint) hooks.
//
// Hooks invoke binaries by bare name — husky v9's `_/h` shim prepends
// node_modules/.bin to PATH, so `lint-staged` / `commitlint` resolve there
// directly. We never shell out to `npx`: when a tool isn't locally cached
// npx falls back to a registry fetch, which fails on systems with
// locked-down npm caches and is wrong in yarn-managed repos to begin with.

import {execFileSync} from 'node:child_process';
import {writeFileSync, chmodSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf-8'}).trim();
const huskyDir = join(root, '.husky');

// Resolve husky's CLI from the installed dependency tree, not via PATH/npx.
const here = dirname(fileURLToPath(import.meta.url));
const huskyBin = [
  join(root, 'node_modules', 'husky', 'bin.js'),
  join(here, '..', '..', 'husky', 'bin.js'),
].find(existsSync);

if (!huskyBin) {
  console.error(
    'star-config: husky binary not found. Expected node_modules/husky/bin.js. ' +
    'Did `yarn install` complete successfully?',
  );
  process.exit(1);
}

execFileSync(process.execPath, [huskyBin], {cwd: root, stdio: 'inherit'});

writeFileSync(join(huskyDir, 'pre-commit'), 'lint-staged\n');
chmodSync(join(huskyDir, 'pre-commit'), 0o755);

writeFileSync(join(huskyDir, 'commit-msg'), 'commitlint --edit "$1"\n');
chmodSync(join(huskyDir, 'commit-msg'), 0o755);

console.log('star-config: husky hooks installed (pre-commit + commit-msg)');
