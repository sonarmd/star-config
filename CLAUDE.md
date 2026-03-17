# @sonarmd/star-config — Agent Instructions

This is the shared dev tooling config for all SonarMD JavaScript and TypeScript projects.

## What This Package Provides

Consumers add `@sonarmd/star-config` as a devDependency and extend from it:

| Export | Purpose | Consumer file |
|--------|---------|---------------|
| `@sonarmd/star-config/eslint` | ESLint flat config (TS + optional React) | `eslint.config.mjs` |
| `@sonarmd/star-config/prettier` | Prettier formatting rules | `prettier.config.cjs` |
| `@sonarmd/star-config/lint-staged` | Pre-commit lint + format staged files | `.lintstagedrc.cjs` |
| `@sonarmd/star-config/commitlint` | Conventional commit message validation | `commitlint.config.cjs` |
| `@sonarmd/star-config/tsconfig/base` | Base TypeScript config | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node18` | Node.js 18 (ES2022, Node16 modules) | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node20` | Node.js 20 (ES2023, Node16 modules) | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node22` | Node.js 22 (ES2024, Node16 modules) | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node-api` | Express/API (CommonJS, ES2020) | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/react-app` | React (Vite/CRA, JSX) | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/library` | Shared libraries (strict, declarations) | `tsconfig.json` extends |
| `@sonarmd/star-config/husky/install.mjs` | One-time hook installer | `npx` or postinstall |

## Commit Convention

All commits to this repo and all consuming repos use **Conventional Commits**:

```
feat: add node22 tsconfig variant
fix: eslint react plugin version conflict
chore: bump dependencies
docs: update agent instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Development

```bash
yarn install          # install deps
yarn lint             # eslint + prettier check
yarn test             # node --test
```

## When Modifying This Package

- This package is consumed by every SonarMD repo. Changes here propagate everywhere.
- Do not make breaking changes without bumping the major version.
- Test config changes against at least one consumer (agora, triggr_api, or frontend).
- ESLint flat config is the default. Legacy CJS config is maintained for older repos.
- Prettier config is intentionally opinionated. Do not add options without team consensus.
- TypeScript configs target specific Node versions. Match `target` and `lib` to the ES spec year for that Node major.

## Publishing

Tagging triggers the release workflow:

```bash
git tag v2.1.0
git push origin v2.1.0
```

The GitHub Actions workflow builds, packs, checksums, and publishes to GitHub Packages (`npm.pkg.github.com`).
