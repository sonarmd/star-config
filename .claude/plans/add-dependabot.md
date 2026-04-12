# Plan: Add Repo Setup to star-config

## Goal
Add a comprehensive repo-level config installer to `@sonarmd/star-config` that standardizes GitHub configs, editor settings, and security policy across all SonarMD repos.

## Files to create

### Templates (`repo-setup/templates/`)
1. `dependabot.yml` → `.github/dependabot.yml` (already exists in dependabot/, reuse)
2. `CODEOWNERS` → `.github/CODEOWNERS`
3. `pull_request_template.md` → `.github/pull_request_template.md`
4. `SECURITY.md` → `.github/SECURITY.md`
5. `editorconfig` → `.editorconfig`
6. `gitattributes` → `.gitattributes`

### Installer (`repo-setup/install.mjs`)
- Single script installs all templates
- Skips existing files (prints warning)
- `--force` flag overwrites existing
- Reports what was installed

### Update package.json
- Add export: `"./repo-setup/install": "./repo-setup/install.mjs"`
- Add `repo-setup/` to `files` array
- Bump version to 3.2.0

### Update CLAUDE.md
- Add row for repo-setup export

### Remove standalone dependabot/
- Fold dependabot.yml into repo-setup/templates/
- Keep dependabot/install.mjs as a thin wrapper calling repo-setup with --only dependabot

## Dogfood
- star-config's own .github/ gets all the templates too

## Push
- Commit and push (includes the 2 existing CI commits)
