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
