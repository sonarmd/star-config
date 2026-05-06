// @sonarmd/star-config — shared version utilities for auto-tag workflow
import {execSync} from 'node:child_process';

export function run(cmd) {
  return execSync(cmd, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit']}).trim();
}

export function latestGaTag() {
  const tag = run("git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-version:refname | grep -v '_rc' | head -n 1");
  return tag || 'v0.0.0';
}

export function latestRcTag() {
  const tag = run("git tag -l 'v[0-9]*.[0-9]*.[0-9]*_rc' --sort=-version:refname | head -n 1");
  return tag || '';
}

export function bumpVersion(version, type) {
  const parts = version.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  let [major, minor, patch] = parts;
  if (type === 'major') { major++; minor = 0; patch = 0; }
  else if (type === 'minor') { minor++; patch = 0; }
  else { patch++; }
  return `${major}.${minor}.${patch}`;
}

export function detectBumpType(commitMessage, prTitle, labels = []) {
  const labelNames = labels.map(l => (l.name || '').toLowerCase());
  const majorLabels = new Set(['semver:major', 'release:major', 'version:major', 'major']);
  const minorLabels = new Set(['semver:minor', 'release:minor', 'version:minor', 'minor']);

  if (labelNames.some(n => majorLabels.has(n))) return 'major';
  if (labelNames.some(n => minorLabels.has(n))) return 'minor';

  const msg = (commitMessage + ' ' + prTitle).toLowerCase();
  if (/\[major\]|#major/.test(msg)) return 'major';
  if (/\[minor\]|#minor/.test(msg)) return 'minor';

  return 'patch';
}

export function shouldSkip(commitMessage, prTitle) {
  const skipPattern = /\[skip\s+tag\]|\[skip\s+release\]/i;
  return skipPattern.test(commitMessage) || skipPattern.test(prTitle);
}
