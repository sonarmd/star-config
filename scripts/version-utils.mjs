// @sonarmd/star-config — Shared version utilities for auto-tag workflow
// Used by .github/workflows/auto-tag.yml

import {execSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';

export function run(cmd) {
  try {
    return execSync(cmd, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit']}).trim();
  } catch (error) {
    if (error.stdout) {
      console.error(error.stdout.toString());
    }
    throw error;
  }
}

export function latestGaTag() {
  const tags = run("git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-version:refname");
  for (const tag of tags.split('\n')) {
    if (tag && !tag.endsWith('_rc')) {
      return tag;
    }
  }
  return 'v0.0.0';
}

export function latestRcTag() {
  const tag = run("git tag -l 'v[0-9]*.[0-9]*.[0-9]*_rc' --sort=-version:refname | head -n 1");
  return tag || '';
}

export function versionTuple(v) {
  return v
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

export function greaterVersion(a, b) {
  const ta = versionTuple(a);
  const tb = versionTuple(b);
  for (let i = 0; i < 3; i += 1) {
    if (ta[i] > tb[i]) {
      return a;
    }
    if (ta[i] < tb[i]) {
      return b;
    }
  }
  return a;
}

export function bumpVersion(version, type) {
  let [major, minor, patch] = versionTuple(version);
  if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

// Only match explicit bracket syntax: [major], [minor], #major, #minor
const MAJOR_HINT = /\[major\]|#major/;
const MINOR_HINT = /\[minor\]|#minor/;
const SKIP_PATTERN = /\[skip\s+tag\]|\[skip\s+release\]/i;

export function detectBumpFromText(text, currentBump) {
  if (MAJOR_HINT.test(text)) {
    return 'major';
  }
  if (MINOR_HINT.test(text) && currentBump !== 'major') {
    return 'minor';
  }
  return currentBump;
}

export function shouldSkip(text) {
  return SKIP_PATTERN.test(text);
}

export function tagAndPush(tagName, targetSha) {
  const existing = run(`git tag -l '${tagName}'`);
  if (existing) {
    console.log(`Tag ${tagName} already exists; skipping.`);
    process.exit(0);
  }

  run(`git tag ${tagName} ${targetSha}`);
  run(`git push origin ${tagName}`);

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tagName}\n`);
  }
}
