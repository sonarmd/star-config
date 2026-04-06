# @sonarmd/star-config — Agent Instructions

This is the shared dev tooling config for all SonarMD JavaScript and TypeScript projects.

## What This Package Provides

Consumers add `@sonarmd/star-config` as a devDependency and extend from it:

| Export                                    | Purpose                                                          | Consumer file           |
| ----------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| `@sonarmd/star-config/eslint`             | ESLint flat config (TS + optional React + auto-IaC detection)    | `eslint.config.mjs`     |
| `@sonarmd/star-config/eslint/sonar`       | SonarJS layer — always-on, 18 code quality rules                 | internal / advanced     |
| `@sonarmd/star-config/eslint/security`    | Security layer — always-on, via eslint-plugin-security           | internal / advanced     |
| `@sonarmd/star-config/eslint/iac`         | IaC layer — CDK/CloudFormation anti-pattern rules (auto-detect)  | internal / advanced     |
| `@sonarmd/star-config/prettier`           | Prettier formatting rules                                        | `prettier.config.cjs`   |
| `@sonarmd/star-config/lint-staged`        | Pre-commit lint + format staged files                            | `.lintstagedrc.cjs`     |
| `@sonarmd/star-config/commitlint`         | Conventional commit message validation                           | `commitlint.config.cjs` |
| `@sonarmd/star-config/tsconfig/base`      | Base TypeScript config                                           | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node18`    | Node.js 18 (ES2022, Node16 modules)                              | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node20`    | Node.js 20 (ES2023, Node16 modules)                              | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node22`    | Node.js 22 (ES2024, Node16 modules)                              | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node-api`  | Express/API (CommonJS, ES2020)                                   | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/react-app` | React (Vite/CRA, JSX)                                            | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/library`   | Shared libraries (strict, declarations)                          | `tsconfig.json` extends |
| `@sonarmd/star-config/husky/install.mjs`  | One-time hook installer                                          | `npx` or postinstall    |
| `@sonarmd/star-config/iac/detect`         | IaC type detection utility (TypeScript, compiled)                | CDK/IaC tooling         |
| `@sonarmd/star-config/iac/cdk-nag`        | cdk-nag HIPAA compliance integration (TypeScript, compiled)      | `bin/app.ts`            |

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
yarn build            # compile iac/*.ts → dist/
yarn lint             # eslint + prettier check
yarn test             # build + node --test
```

## ESLint Flat Config — Layer Architecture

The main entry (`./eslint`) composes layers in this order:

| Layer | Always-on | Notes |
|-------|-----------|-------|
| `javascript` | yes | base rules, import ordering, hygiene |
| `sonar` | yes | SonarJS — 18 code quality + complexity rules |
| `security` | yes | eslint-plugin-security — OWASP-aligned rules |
| `typescript` | yes (opt-out) | TS rules, default on |
| `react` | no | opt-in via `react: true` |
| `iac` | auto | detected from `cdk.json`, `aws-cdk-lib`, CloudFormation markers |

```js
// eslint.config.mjs
import starConfig from '@sonarmd/star-config/eslint';
export default starConfig({
  typescript: true,   // default
  react: false,       // default
  iac: 'auto',        // default — auto-detects CDK/CloudFormation repos
});
```

### IaC Layer (`eslint/iac`)

Auto-included when a CDK or CloudFormation project is detected. Enforces HIPAA/SOC2 compliant infrastructure patterns:

- Bans hardcoded ARNs, account IDs, and AWS regions
- Bans `RemovalPolicy.DESTROY` (must use `RETAIN` or `SNAPSHOT`)
- Bans wildcard `*` in IAM `actions`/`resources` arrays
- Bans `console.log` in IaC code (use structured logging)

### cdk-nag Integration (`iac/cdk-nag`)

```typescript
// bin/app.ts
import { applyHIPAAChecks } from '@sonarmd/star-config/iac/cdk-nag';

const app = new cdk.App();
// ... create stacks ...
await applyHIPAAChecks(app, {
  verbose: true,
  suppressions: [
    { id: 'AwsSolutions-IAM4', reason: 'AWS managed policies acceptable for deploy role' },
  ],
});
app.synth();
```

Requires `cdk-nag` as an optional peer dependency: `yarn add -D cdk-nag`

### AWS Config Conformance Check (`iac/conformance-check.sh`)

CI script that validates the AWS account against the HIPAA conformance pack:

```bash
./node_modules/@sonarmd/star-config/iac/conformance-check.sh \
  --pack-name Operational-Best-Practices-for-HIPAA-Security \
  --output conformance-results.xml
```

Fails the build on 12 critical rules (S3 encryption, RDS encryption, public access, IAM admin, SSH, CloudTrail, etc.).

## When Modifying This Package

- This package is consumed by every SonarMD repo. Changes here propagate everywhere.
- Do not make breaking changes without bumping the major version.
- Test config changes against at least one consumer (agora, triggr_api, or frontend).
- ESLint flat config is the default. Legacy CJS config is maintained for older repos.
- Prettier config is intentionally opinionated. Do not add options without team consensus.
- TypeScript configs target specific Node versions. Match `target` and `lib` to the ES spec year for that Node major.
- New TypeScript utility modules go in `iac/` and are compiled to `dist/` via `tsconfig.build.json`.

## Publishing

Tagging triggers the release workflow:

```bash
git tag v3.0.0
git push origin v3.0.0
```

The GitHub Actions workflow builds (`yarn build`), packs, checksums, and publishes to GitHub Packages (`npm.pkg.github.com`).
