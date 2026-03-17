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

import {execSync} from 'node:child_process';
import {writeFileSync, mkdirSync, chmodSync} from 'node:fs';
import {join} from 'node:path';

const root = execSync('git rev-parse --show-toplevel', {encoding: 'utf-8'}).trim();
const huskyDir = join(root, '.husky');

// Initialize husky (v9+: creates .husky/_ directory with husky.sh)
execSync('npx husky', {cwd: root, stdio: 'inherit'});

// pre-commit: lint-staged
writeFileSync(join(huskyDir, 'pre-commit'), 'npx lint-staged\n');
chmodSync(join(huskyDir, 'pre-commit'), 0o755);

// commit-msg: commitlint
writeFileSync(join(huskyDir, 'commit-msg'), 'npx --no -- commitlint --edit "$1"\n');
chmodSync(join(huskyDir, 'commit-msg'), 0o755);

console.log('star-config: husky hooks installed (pre-commit + commit-msg)');
