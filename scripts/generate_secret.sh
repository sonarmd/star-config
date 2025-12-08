#!/usr/bin/env bash
set -euo pipefail

# ---------- config (override with env vars) ----------
GPG_NAME="${GPG_NAME:-Anthony Vespoli}"
GPG_EMAIL="${GPG_EMAIL:-you@example.com}"
GPG_EXPIRE="${GPG_EXPIRE:-2y}"             # key lifetime
OP_VAULT="${OP_VAULT:-SharedVault}"        # 1Password vault name (must match the service account access)
OP_ITEM_TITLE="${OP_ITEM_TITLE:-GPG-Signing-Key}" # Document title used by CI
# ----------------------------------------------------

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need gpg
need op
need gh
need jq

echo "Generating GPG key for $GPG_NAME <$GPG_EMAIL> ..."

# non interactive key generation
gpg --batch --yes --passphrase '' \
  --quick-generate-key "$GPG_NAME <$GPG_EMAIL>" ed25519 sign "$GPG_EXPIRE"

# grab key id
KEY_ID="$(
  gpg --list-secret-keys --keyid-format=long "$GPG_EMAIL" \
    | awk '/^sec/{print $2}' \
    | sed 's#.*/##' \
    | head -n1
)"

if [ -z "$KEY_ID" ]; then
  echo "Could not find generated key for $GPG_EMAIL" >&2
  exit 1
fi

echo "Using key id: $KEY_ID"

PUB_TMP="$(mktemp)"
PRIV_TMP="$(mktemp)"
trap 'rm -f "$PUB_TMP" "$PRIV_TMP"' EXIT

gpg --armor --export "$KEY_ID" > "$PUB_TMP"
gpg --armor --export-secret-key "$KEY_ID" > "$PRIV_TMP"

echo "Storing GPG private key in 1Password vault '$OP_VAULT' as document '$OP_ITEM_TITLE' ..."

ITEM_JSON="$(
  op document create "$PRIV_TMP" \
    --vault "$OP_VAULT" \
    --title "$OP_ITEM_TITLE" \
    --format json
)"

OP_ITEM_ID="$(echo "$ITEM_JSON" | jq -r '.id // .uuid')"

if [ -z "$OP_ITEM_ID" ] || [ "$OP_ITEM_ID" = "null" ]; then
  echo "Failed to create 1Password document; response was:" >&2
  echo "$ITEM_JSON" >&2
  exit 1
fi

echo "Created 1Password document: $OP_ITEM_ID"

echo "Uploading public key to GitHub via gh api ..."

gh api \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  /user/gpg_keys \
  -f armored_public_key="$(cat "$PUB_TMP")" >/dev/null

echo "Configuring git to use this key ..."

git config --global user.signingkey "$KEY_ID"
git config --global commit.gpgsign true

echo
echo "Done."
echo "GPG key id:        $KEY_ID"
echo "1Password item id: $OP_ITEM_ID"
echo "Git is now set to sign commits with this key."
