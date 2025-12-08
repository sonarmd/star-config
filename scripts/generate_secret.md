# Generate and store the release signing key

This script creates a new GPG key, uploads the public key to GitHub, and saves the **private** key in 1Password so the release workflow can import it.

1) Make sure you can use the required CLIs locally: `gpg`, `op` (logged in to a vault the service account can read), `gh`, and `jq`.
2) Make the script executable (one-time):
   `chmod +x scripts/generate_secret.sh`
3) Run it with your info (vault/title defaults match the workflow):
   ```bash
   GPG_NAME="Anthony Vespoli" \
   GPG_EMAIL="avespoli@sonarmd.com" \
   OP_VAULT="SharedVault" \
   OP_ITEM_TITLE="GPG-Signing-Key" \
   ./scripts/generate_secret.sh
   ```
4) The script will:
   - Generate a new ed25519 signing key (2y expiry by default)
   - Store the armored private key as a 1Password **document** titled `GPG-Signing-Key` in vault `SharedVault`
   - Upload the public key to your GitHub account via `gh api`
   - Set your git globals to sign commits with the new key
5) In GitHub, add `OP_SERVICE_ACCOUNT_TOKEN` (service account with read access to the vault/item) to repo/org secrets. The release workflow will then import the key and sign checksums automatically.

temp
