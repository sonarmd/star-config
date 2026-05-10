#!/usr/bin/env bash
# scripts/dev-setup.sh — one-time per-machine setup for star-config consumers.
#
# Pins the current shell user's ~/.npmrc to the SonarMD private registry.
# Idempotent: if the line already exists, exits 0 and changes nothing.
#
# Usage:
#   curl -sSf https://raw.githubusercontent.com/sonarmd/star-config/main/scripts/dev-setup.sh | bash
#   # or, after cloning a consumer repo that has @sonarmd/star-config installed:
#   bash node_modules/@sonarmd/star-config/scripts/dev-setup.sh
#
# What it does NOT do:
#   - install or modify any token, password, or credential
#   - touch any file outside ~/.npmrc
#   - install software
#
# After running this once, `yarn add` and `yarn install` work silently against
# the private registry as long as the machine is on the SonarMD tailnet.

set -euo pipefail

REGISTRY="${SONARMD_REGISTRY:-https://npm.sonarmd.ts.net}"
NPMRC="$HOME/.npmrc"
LINE="registry=$REGISTRY"

if [ -f "$NPMRC" ] && grep -Fxq "$LINE" "$NPMRC"; then
  echo "star-config: ~/.npmrc already pins registry=$REGISTRY — nothing to do."
  exit 0
fi

if [ -f "$NPMRC" ] && grep -E '^registry=' "$NPMRC" > /dev/null; then
  echo "star-config: ~/.npmrc already has a registry= line pointing somewhere else."
  echo "             Refusing to overwrite. Edit ~/.npmrc manually if you want to switch."
  echo
  echo "Current value:"
  grep -E '^registry=' "$NPMRC"
  echo
  echo "Desired value:"
  echo "  $LINE"
  exit 1
fi

printf '%s\n' "$LINE" >> "$NPMRC"
echo "star-config: appended '$LINE' to ~/.npmrc."
echo "             You should now be able to 'yarn add @sonarmd/star-config' on the tailnet."
