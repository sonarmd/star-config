# @sonarmd/star-config — Agent Instructions

This is the shared dev tooling config for all SonarMD JavaScript and TypeScript projects.

## What This Package Provides

Consumers add `@sonarmd/star-config` as a devDependency and extend from it:

| Export                                    | Purpose                                                                                                     | Consumer file           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| `@sonarmd/star-config/eslint`             | ESLint flat config (TS + optional React + auto-IaC detection)                                               | `eslint.config.mjs`     |
| `@sonarmd/star-config/eslint/sonar`       | SonarJS layer — always-on, 18 code quality rules                                                            | internal / advanced     |
| `@sonarmd/star-config/eslint/security`    | Security layer — always-on, via eslint-plugin-security                                                      | internal / advanced     |
| `@sonarmd/star-config/eslint/iac`         | IaC layer — CDK/CloudFormation anti-pattern rules (auto-detect)                                             | internal / advanced     |
| `@sonarmd/star-config/prettier`           | Prettier formatting rules                                                                                   | `prettier.config.cjs`   |
| `@sonarmd/star-config/lint-staged`        | Pre-commit lint + format staged files                                                                       | `.lintstagedrc.cjs`     |
| `@sonarmd/star-config/commitlint`         | Conventional commit message validation                                                                      | `commitlint.config.cjs` |
| `@sonarmd/star-config/tsconfig/base`      | Base TypeScript config                                                                                      | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node18`    | Node.js 18 (ES2022, Node16 modules)                                                                         | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node20`    | Node.js 20 (ES2023, Node16 modules)                                                                         | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node22`    | Node.js 22 (ES2024, Node16 modules)                                                                         | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/node-api`  | Express/API (CommonJS, ES2020)                                                                              | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/react-app` | React (Vite/CRA, JSX)                                                                                       | `tsconfig.json` extends |
| `@sonarmd/star-config/tsconfig/library`   | Shared libraries (strict, declarations)                                                                     | `tsconfig.json` extends |
| `@sonarmd/star-config/husky/install.mjs`  | One-time hook installer                                                                                     | `npx` or postinstall    |
| `@sonarmd/star-config/iac/detect`         | IaC type detection utility (TypeScript, compiled)                                                           | CDK/IaC tooling         |
| `@sonarmd/star-config/iac/cdk-nag`        | cdk-nag HIPAA compliance integration (TypeScript, compiled)                                                 | `bin/app.ts`            |
| `@sonarmd/star-config/dependabot/install` | Dependabot-only installer (delegates to repo-setup)                                                         | `npx` or postinstall    |
| `@sonarmd/star-config/repo-setup/install` | Full repo setup (dependabot, CODEOWNERS, PR template, SECURITY, editorconfig, gitattributes, release notes) | `npx` or postinstall    |

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

| Layer        | Always-on     | Notes                                                           |
| ------------ | ------------- | --------------------------------------------------------------- |
| `javascript` | yes           | base rules, import ordering, hygiene                            |
| `sonar`      | yes           | SonarJS — 18 code quality + complexity rules                    |
| `security`   | yes           | eslint-plugin-security — OWASP-aligned rules                    |
| `typescript` | yes (opt-out) | TS rules, default on                                            |
| `react`      | no            | opt-in via `react: true`                                        |
| `iac`        | auto          | detected from `cdk.json`, `aws-cdk-lib`, CloudFormation markers |

```js
// eslint.config.mjs
import starConfig from '@sonarmd/star-config/eslint';
export default starConfig({
  typescript: true, // default
  react: false, // default
  iac: 'auto', // default — auto-detects CDK/CloudFormation repos
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
import {applyHIPAAChecks} from '@sonarmd/star-config/iac/cdk-nag';

const app = new cdk.App();
// ... create stacks ...
await applyHIPAAChecks(app, {
  verbose: true,
  suppressions: [
    {id: 'AwsSolutions-IAM4', reason: 'AWS managed policies acceptable for deploy role'},
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

Tagging is the only thing this repo does. Publishing happens out-of-band via Ansible — the controller pulls new tags from GitHub, runs `yarn build && yarn pack`, and publishes the tarball to the SonarMD private registry on the tailnet.

```bash
git tag v4.0.1
git push origin v4.0.1
```

That's it. No `.github/workflows/publish.yml`. No registry token in CI. No `publishConfig` in `package.json`. The repo is a build artifact source; Ansible owns the publish step.

The registry itself runs on the tailnet (Verdaccio + S3 storage backend). Authentication is by tailnet membership — the registry has no users database. Anyone on the tailnet can install; only the Ansible controller node can publish (enforced by tailnet ACLs).

## Install UX (the whole point of v4)

Consumers install with **zero config** beyond a one-time per-machine setup:

```bash
# one time per machine, by the dev:
bash node_modules/@sonarmd/star-config/scripts/dev-setup.sh
# from then on:
yarn add @sonarmd/star-config
```

In CI, consumers add **one line** to their workflow:

```yaml
- uses: sonarmd/star-config/actions/install@v4
  with:
    ts-oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
    ts-oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
```

`TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET` are set once at the GitHub **organization** level. Every repo inherits them. No per-repo secrets, no `.npmrc` checked in anywhere.

## What v4 Removed (compared to v3)

- The `postinstall` puppet-master script. No longer mutates consumer `package.json`, no longer auto-injects workflows or husky hooks, no longer creates `.lintstagedrc.mjs`. Consumers opt in to whatever they want, when they want.
- The GHP publish workflow and `publishConfig.registry` pin.
- The `.npmrc` registry-mapping line that consumers had to mirror.
- `husky` and `lint-staged` from `dependencies` (now devDependencies — consumers install themselves if they want them).
