#!/usr/bin/env node
// @sonarmd/star-config — Husky hook installer
//
// Bootstrap script for setting up git hooks. Run ONCE per repo, manually,
// after `yarn install` finishes:
//
//   node node_modules/@sonarmd/star-config/husky/install.mjs
//
// DO NOT put this in a "prepare" lifecycle hook in package.json. yarn v1
// runs prepare during install in parallel with tarball extraction; the
// fs activity here (npx husky, writes, chmods, walking to git root) races
// with yarn's cache extraction and surfaces as ENOENT on unrelated
// packages — extremely hard to diagnose, easy to misattribute to yarn.
//
// To enforce, refuse to run when invoked from a package lifecycle. yarn
// and npm both set `npm_lifecycle_event` (e.g. "prepare") and `INIT_CWD`
// during lifecycle execution. Bail noisily so consumers move it out.

import {execSync} from 'node:child_process';
import {writeFileSync, chmodSync} from 'node:fs';
import {join} from 'node:path';

const lifecycleEvent = process.env.npm_lifecycle_event;
const initCwd = process.env.INIT_CWD;

if (lifecycleEvent || initCwd) {
  console.error(
    `star-config: husky/install.mjs was invoked from a package lifecycle ` +
    `(${lifecycleEvent ?? 'INIT_CWD is set'}). Skipping. ` +
    `Run this manually after install completes — see comment at top of file.`,
  );
  // Exit 0 so consumers' installs don't fail; this is a hardening guard,
  // not a correctness check.
  process.exit(0);
}

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
