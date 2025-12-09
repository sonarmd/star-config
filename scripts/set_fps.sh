#!/usr/bin/env bash
set -euo pipefail

VAULT="${VAULT:-CI/CD}"
ITEM_TITLE="${ITEM_TITLE:-GPG-Signing-Key}"
GH_ORG="${GH_ORG:-sonarmd}"   # set to org name for org secrets; leave empty for repo secrets
# If you need to auth gh with an admin:org token, set one of:
#   GH_ADMIN_TOKEN           (token value)
#   GH_ADMIN_TOKEN_FILE      (path to file with token)
#   GH_ADMIN_TOKEN_OP        (1Password op:// path to token secret)

ITEM_ID="$(
  op item list --vault "$VAULT" --format json \
    | jq -r --arg t "$ITEM_TITLE" '.[] | select(.title==$t) | .id' \
    | head -n1
)"

if [ -z "$ITEM_ID" ]; then
  echo "No item titled \"$ITEM_TITLE\" found in vault \"$VAULT\"." >&2
  exit 1
fi

FPR="$(
  op document get "$ITEM_ID" --vault "$VAULT" \
    | gpg --batch --import-options show-only --with-colons --import 2>/dev/null \
    | awk -F: '/^fpr:/{print $10; exit}'
)"

if [ -z "$FPR" ]; then
  echo "Could not extract fingerprint from item $ITEM_ID" >&2
  exit 1
fi

echo "Using item: $ITEM_ID"
echo "Fingerprint: $FPR"

login_with_admin_token() {
  if [ -n "${GH_ADMIN_TOKEN:-}" ]; then
    echo "$GH_ADMIN_TOKEN" | gh auth login --with-token >/dev/null
    return
  fi
  if [ -n "${GH_ADMIN_TOKEN_FILE:-}" ] && [ -f "$GH_ADMIN_TOKEN_FILE" ]; then
    gh auth login --with-token < "$GH_ADMIN_TOKEN_FILE" >/dev/null
    return
  fi
  if [ -n "${GH_ADMIN_TOKEN_OP:-}" ]; then
    op read "$GH_ADMIN_TOKEN_OP" | gh auth login --with-token >/dev/null
    return
  fi
}

if [ -n "$GH_ORG" ]; then
  login_with_admin_token
  gh secret set OP_GPG_ITEM_ID --org "$GH_ORG" --body "$ITEM_ID"
  gh secret set OP_GPG_EXPECTED_FPR --org "$GH_ORG" --body "$FPR"
else
  gh secret set OP_GPG_ITEM_ID --body "$ITEM_ID"
  gh secret set OP_GPG_EXPECTED_FPR --body "$FPR"
fi

echo "Secrets set successfully."
