# Changelog


Append-only: add new entries below without modifying previous ones.

## 2024-05-17
- Package renamed to `@sonarmd/star-config` with cleaned exports (removed legacy tsconfig.prd and unused eslint-ts entry).
- Pre-commit helper now appends `yarn prettier --write && yarn eslint --fix` to run formatting before linting.
- Added GitHub Actions workflow to pack the module on every push, publish a SHA-256 checksum, and optionally sign the checksum with a GPG key provided via repo secrets.
- Documented namespaced usage for ESLint, Prettier, lint-staged, git hooks, and TypeScript config.

## 2024-05-18
- Added append-only integrity ledger (`integrity-log.md`) and CI workflow (`.github/workflows/integrity-log.yml`) that packs the module, records SHA-256, and stores declared SSH public keys plus GPG key ID per push.
- `pack-hash-sign` workflow now skips when the commit message contains `[skip ci]` to avoid loops from automated log commits.
- README updated with integrity ledger details and required secrets (`SSH_PUBLIC_KEYS`, optional `GPG_KEY_ID`).

## 2024-05-19
- Replaced push-based integrity jobs with tag-driven release workflow (`.github/workflows/release.yml`) for RC (`v*.*.*_rc`) and GA (`v*.*.*`) tags; packs, hashes, optionally signs, and publishes GitHub releases.
- Added `scripts/generate-release-notes.js` to produce release notes containing commit SHA, tarball name, SHA-256, commit signature fingerprint/algorithm/state, and full dependency version lists.
- Updated README to describe the tag-based release flow, manual append-only ledger updates, and visibility of signing key fingerprints in release notes.

## 2024-05-20
- Restructured into Yarn workspaces with individual packages (`@sonarmd/eslint-config`, `@sonarmd/prettier-config`, `@sonarmd/lint-staged-config`, `@sonarmd/githooks-config`, `@sonarmd/tsconfig`, `@sonarmd/scripts`) and a meta package `@sonarmd/star-config` that depends on all.
- Added `scripts/pack-and-checksum.js` to Yarn-pack every workspace, emit SHA-256 checksums, and prepare release assets; release workflow now uses it.
- Updated `scripts/generate-release-notes.js` to produce per-package dependency/version details plus commit signature fingerprint info and checksum file reference.
- README rewritten for Yarn-only usage, per-package installs, meta package behavior, and release integrity expectations.
