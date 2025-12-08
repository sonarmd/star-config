## @sonarmd/star-config

Namespaced, zero-config toolchain for SonarMD projects (ESLint, Prettier, lint-staged, git hooks, TS config, and helper scripts).

### Install

```bash
npm install --save-dev @sonarmd/star-config eslint prettier lint-staged husky typescript
```

### ESLint

Modern ruleset:

```json
{
  "extends": ["@sonarmd/star-config"]
}
```

Legacy ruleset:

```json
{
  "extends": ["@sonarmd/star-config/eslint/legacy"]
}
```

### Prettier

```json
{
  "prettier": "@sonarmd/star-config/prettier"
}
```

### lint-staged

```json
{
  "lint-staged": "@sonarmd/star-config/lint-staged"
}
```

### Git hooks

Use the provided hook command to run lint-staged (works with simple-git-hooks or a raw pre-commit hook):

```json
{
  "githooks": "@sonarmd/star-config/githooks"
}
```

or directly:

```bash
node node_modules/@sonarmd/star-config/scripts/run-lint-staged.js
```

### TypeScript

```json
{
  "extends": "@sonarmd/star-config/tsconfig"
}
```

### Release integrity

- Workflow `.github/workflows/pack-hash-sign.yml` runs on every push to pack the module and emit a `checksums.txt` (SHA-256) alongside the tarball artifact.
- If repo secrets `GPG_PRIVATE_KEY` (ASCII-armored) and `GPG_PASSPHRASE` are set, the workflow also creates `checksums.txt.asc` as an ASCII-armored detached signature.
- Verification steps: import the public key, run `gpg --verify checksums.txt.asc checksums.txt`, then run `shasum -a 256 <tarball>` and compare with the recorded checksum.
- Workflow `.github/workflows/integrity-log.yml` appends an entry to `integrity-log.md` on each push (skips when `[skip ci]` is in the commit message) capturing the commit SHA, ref, packed tarball name, SHA-256 checksum, declared `GPG_KEY_ID`, and SSH public keys.
- Set repo secrets: `SSH_PUBLIC_KEYS` (newline-separated keys you trust) and optionally `GPG_KEY_ID` (to record which key signs releases). The log is append-only; do not edit existing entries.
