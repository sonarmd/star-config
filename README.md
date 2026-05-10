# @sonarmd/star-config

Shared dev tooling config for all SonarMD JavaScript and TypeScript projects:
ESLint flat config (with always-on SonarJS + security layers), Prettier,
commitlint, lint-staged, husky setup, TypeScript configs for several targets,
IaC linting, cdk-nag HIPAA bindings, plus pre-baked configs for security and
quality scanners (gitleaks, semgrep, trivy, jscpd, knip, coverage).

## Install (one time per machine)

The package lives on the SonarMD private registry, reachable on the tailnet.
Run this once on a fresh machine:

```bash
bash <(curl -sSf https://raw.githubusercontent.com/sonarmd/star-config/main/scripts/dev-setup.sh)
```

This adds one line — `registry=https://npm.sonarmd.ts.net` — to your
`~/.npmrc`. No tokens, no PATs, no auth headers. The tailnet is the perimeter
— if your machine is on the tailnet, you can install. If not, you can't.

After that, install in any consumer repo:

```bash
yarn add -D @sonarmd/star-config
```

## CI

Add one step to your workflow:

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - uses: sonarmd/star-config/actions/install@v4
        with:
          ts-oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          ts-oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
      - run: yarn build
      - run: yarn test
```

`TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET` are set at the GitHub **organization**
level. Every repo inherits them. Nothing per-repo to configure.

See [`actions/install/README.md`](actions/install/README.md) for full details.

## Use

```js
// eslint.config.mjs
import starConfig from '@sonarmd/star-config/eslint';
export default starConfig({
  typescript: true, // default
  react: false, // default
  iac: 'auto', // auto-detects CDK / CloudFormation projects
});
```

```js
// prettier.config.cjs
module.exports = require('@sonarmd/star-config/prettier');
```

```js
// commitlint.config.cjs
module.exports = require('@sonarmd/star-config/commitlint');
```

```js
// .lintstagedrc.cjs
module.exports = require('@sonarmd/star-config/lint-staged');
```

```jsonc
// tsconfig.json
{
  "extends": "@sonarmd/star-config/tsconfig/node22",
}
```

Available `tsconfig` variants:
`base`, `node18`, `node20`, `node22`, `node-api` (Express/CJS), `react-app`
(Vite/CRA), `library` (strict + declarations).

## Optional setup helpers

These scripts are **opt-in only** — they don't run automatically on install.
Run them once per repo if you want what they do:

```bash
# Install pre-commit + commit-msg git hooks via husky
node node_modules/@sonarmd/star-config/husky/install.mjs

# Add CODEOWNERS, dependabot.yml, PR template, SECURITY.md, .editorconfig,
# .gitattributes — skips files you already have
node node_modules/@sonarmd/star-config/repo-setup/install.mjs

# Just dependabot (subset of repo-setup)
node node_modules/@sonarmd/star-config/dependabot/install.mjs
```

## Publishing (maintainers only)

Tagging is the only thing this repo does in CI. Publishing happens via Ansible:

```bash
git tag v4.0.1
git push origin v4.0.1
```

The Ansible controller pulls the tag, builds, and publishes the tarball to the
private registry. There is no `publish.yml` workflow, no registry token in
GitHub Actions, no `publishConfig` in `package.json`.

## Conventional Commits

```
feat: add node24 tsconfig variant
fix: eslint react plugin version conflict
chore: bump dependencies
docs: clarify install instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`. Enforced by commitlint.

## License

`UNLICENSED` — internal SonarMD use only.
