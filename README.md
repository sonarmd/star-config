## @sonarmd/star-config (monorepo)

Yarn-only toolkit with individually installable packages and a meta package that pulls in the full suite.

Packages:
- `@sonarmd/eslint-config` (modern + legacy)
- `@sonarmd/prettier-config`
- `@sonarmd/lint-staged-config`
- `@sonarmd/githooks-config` (targets `@sonarmd/scripts/run-lint-staged.js`)
- `@sonarmd/tsconfig`
- `@sonarmd/scripts` (run-lint-staged, add-precommit-hook)
- `@sonarmd/star-config` (meta; depends on all of the above)

### Install

- Full suite (installs all components via dependencies):
  ```bash
  yarn add -D @sonarmd/star-config
  ```
- Individual packages (pick what you need):
  ```bash
  yarn add -D @sonarmd/eslint-config @sonarmd/prettier-config @sonarmd/lint-staged-config @sonarmd/githooks-config @sonarmd/tsconfig @sonarmd/scripts
  ```
- Required peer deps (project-level):
  ```bash
  yarn add -D eslint prettier lint-staged typescript husky
  ```

### Usage

- ESLint (modern):
  ```json
  { "extends": ["@sonarmd/eslint-config"] }
  ```
- ESLint (legacy):
  ```json
  { "extends": ["@sonarmd/eslint-config/legacy"] }
  ```
- Prettier:
  ```json
  { "prettier": "@sonarmd/prettier-config" }
  ```
- lint-staged:
  ```json
  { "lint-staged": "@sonarmd/lint-staged-config" }
  ```
- Git hooks (simple-git-hooks or raw hook):
  ```json
  { "githooks": "@sonarmd/githooks-config" }
  ```
  or reference directly in `.git/hooks/pre-commit`:
  ```bash
  node node_modules/@sonarmd/scripts/run-lint-staged.js
  ```
- TypeScript:
  ```json
  { "extends": "@sonarmd/tsconfig/tsconfig.json" }
  ```
- Scripts:
  - `node node_modules/@sonarmd/scripts/run-lint-staged.js`
  - `node node_modules/@sonarmd/scripts/add-precommit-hook.js`

### Release flow & integrity

- Tags drive releases: `v*.*.*_rc` (release candidates) and `v*.*.*` (GA) trigger `.github/workflows/release.yml`.
- The release workflow uses Yarn to pack every workspace, computes SHA-256 for each tarball, optionally signs `checksums.txt` when `GPG_PRIVATE_KEY`/`GPG_PASSPHRASE` secrets are present, and publishes a GitHub release (prerelease for RCs) with all tarballs plus checksums.
- Release notes include: commit SHA, commit signature fingerprint/algorithm/state (SSH-signed commits are required), per-package tarball name/checksum, and full dependency version lists for every package.
- `integrity-log.md` stays append-only and should be updated manually (e.g., pre-commit) with commit hash, checksum, and signer fingerprint; never rewrite existing entries.
