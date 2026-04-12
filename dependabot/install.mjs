#!/usr/bin/env node
// @sonarmd/star-config — Dependabot config installer (standalone)
//
// Thin wrapper around repo-setup/install.mjs --only=dependabot
// For full repo setup, use: node node_modules/@sonarmd/star-config/repo-setup/install.mjs

import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoSetup = join(__dirname, '..', 'repo-setup', 'install.mjs');
const args = process.argv.includes('--force') ? '--force' : '';

execSync(`node ${repoSetup} --only dependabot ${args}`, {stdio: 'inherit'});
