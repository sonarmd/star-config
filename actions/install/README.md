# `actions/install`

Composite GitHub Action that installs node modules using the SonarMD private
registry. Joins the runner to the tailnet, configures npm to use the registry,
runs your install command. No `.npmrc` in the consumer repo. No npm token. No
GitHub-to-AWS trust.

## Usage

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

## Inputs

| Input                | Required | Default                          | Description                                              |
| -------------------- | -------- | -------------------------------- | -------------------------------------------------------- |
| `ts-oauth-client-id` | yes      | —                                | Tailscale OAuth client ID — set as a GitHub org secret.  |
| `ts-oauth-secret`    | yes      | —                                | Tailscale OAuth secret — set as a GitHub org secret.     |
| `registry`           | no       | `https://npm.sonarmd.ts.net`     | Private registry URL. Override only if the host changes. |
| `ts-tags`            | no       | `tag:ci`                         | Tailscale ACL tags applied to the ephemeral runner node. |
| `install-command`    | no       | `yarn install --frozen-lockfile` | Command to run after the registry is wired up.           |
| `working-directory`  | no       | `.`                              | Working directory for the install command.               |

## How it works

1. `tailscale/github-action@v3` brings the runner up as an ephemeral tailnet
   node. The OAuth client mints a short-lived auth key — no static credentials
   in the repo or workflow.
2. The action writes a one-line `.npmrc` to `$RUNNER_TEMP` and points
   `NPM_CONFIG_USERCONFIG` at it. The consumer's repo never carries an
   `.npmrc`.
3. The runner is now on the tailnet, so `yarn install` reaches the registry
   directly. The registry trusts the tailnet — no auth header, no token.

## Org-level setup (one-time)

The org admin sets two secrets at the **GitHub organization** level so every
repo inherits them:

- `TS_OAUTH_CLIENT_ID`
- `TS_OAUTH_SECRET`

These come from the Tailscale admin console (`Settings → OAuth clients`).
Scope the client to `Devices: Read+Write` and tag it appropriately for CI use.
