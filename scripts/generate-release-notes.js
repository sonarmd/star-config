#!/usr/bin/env node
// generate-release-notes.js — "What's in the box" manifest for releases.
//
// Produces a plain-text release notes file with:
//   - Tag, commit SHA, timestamp
//   - Per-package checksums (sha256 of tarballs)
//   - Full dependency manifest (runtime, peer, dev, optional, bundled)
//
// Attestation/signature verification is NOT handled here — ci-sign + Sigstore own that.
//
// Env vars:
//   TAG_NAME           — release tag (falls back to GITHUB_REF_NAME)
//   COMMIT_SHA         — commit being released (falls back to GITHUB_SHA)
//   RELEASE_NOTES_PATH — output file (default: release-notes.md)
//   PACKAGES_FILE      — path to dist/pack-output.json (optional)
//   CHECKSUMS_FILE     — path to dist/checksums.txt (optional)

const fs = require('fs');
const path = require('path');

const TAG_NAME = process.env.TAG_NAME || process.env.GITHUB_REF_NAME || 'unknown-tag';
const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || 'unknown-sha';
const OUTPUT = process.env.RELEASE_NOTES_PATH || 'release-notes.md';
const PACKAGES_FILE =
  process.env.PACKAGES_FILE || path.join(process.cwd(), 'dist', 'pack-output.json');
const CHECKSUMS_FILE =
  process.env.CHECKSUMS_FILE || path.join(process.cwd(), 'dist', 'checksums.txt');

function formatDeps(pkgSection, title) {
  if (!pkgSection || typeof pkgSection !== 'object' || Array.isArray(pkgSection)) {
    return `${title}: none`;
  }
  const entries = Object.entries(pkgSection).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) {
    return `${title}: none`;
  }
  return `${title}:\n${entries.map(([name, version]) => `- ${name}: ${version}`).join('\n')}`;
}

function loadPackages() {
  // Prefer pack-output.json from CI build step
  if (fs.existsSync(PACKAGES_FILE)) {
    return JSON.parse(fs.readFileSync(PACKAGES_FILE, 'utf8'));
  }

  // Fallback: scan packages/ directory (monorepo) or root package.json
  const packagesRoot = path.join(process.cwd(), 'packages');
  if (fs.existsSync(packagesRoot)) {
    const entries = fs.readdirSync(packagesRoot, {withFileTypes: true});
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(packagesRoot, entry.name, 'package.json'))
      .filter((pkgPath) => fs.existsSync(pkgPath))
      .map((pkgPath) => readPkgManifest(pkgPath));
  }

  // Single package fallback
  const rootPkg = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(rootPkg)) {
    return [readPkgManifest(rootPkg)];
  }

  return [];
}

function readPkgManifest(pkgPath) {
  const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return {
    name: data.name,
    version: data.version,
    tarball: 'n/a',
    checksum: 'n/a',
    dependencies: data.dependencies || {},
    peerDependencies: data.peerDependencies || {},
    devDependencies: data.devDependencies || {},
    optionalDependencies: data.optionalDependencies || {},
    bundleDependencies: data.bundleDependencies || {},
  };
}

function loadChecksums() {
  if (!fs.existsSync(CHECKSUMS_FILE)) return {};
  const lines = fs.readFileSync(CHECKSUMS_FILE, 'utf8').trim().split('\n');
  const map = {};
  for (const line of lines) {
    // Format: sha256  filename
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (match) {
      map[path.basename(match[2])] = match[1];
    }
  }
  return map;
}

function main() {
  const packages = loadPackages();
  const checksums = loadChecksums();
  const timestamp = new Date().toISOString();

  const sections = [
    `# Release ${TAG_NAME}`,
    '',
    `- **commit:** \`${COMMIT_SHA}\``,
    `- **timestamp:** ${timestamp}`,
  ];

  if (fs.existsSync(CHECKSUMS_FILE)) {
    sections.push(`- **checksums:** ${CHECKSUMS_FILE}`);
  }

  sections.push('', '## Packages', '');

  for (const pkg of packages) {
    sections.push(`### ${pkg.name} v${pkg.version}`);

    // Match checksum from checksums.txt by tarball filename
    const tarball = pkg.tarball && pkg.tarball !== 'n/a' ? path.basename(pkg.tarball) : null;
    const sha = tarball ? checksums[tarball] : null;

    if (tarball) sections.push(`- tarball: \`${tarball}\``);
    if (sha) sections.push(`- sha256: \`${sha}\``);

    sections.push(formatDeps(pkg.dependencies, 'runtime'));
    sections.push(formatDeps(pkg.peerDependencies, 'peer'));
    sections.push(formatDeps(pkg.devDependencies, 'dev'));
    sections.push(formatDeps(pkg.optionalDependencies, 'optional'));
    sections.push(formatDeps(pkg.bundleDependencies, 'bundled'));
    sections.push('');
  }

  fs.writeFileSync(OUTPUT, sections.join('\n'), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Release notes written to ${OUTPUT} (${packages.length} package(s))`);
}

main();
