## Branch Model

- `main` – release code.
- `develop` – nightly, and upcoming release builds. Base feature work from `develop`.
- Work branches, naming convention: `feat/<feature-name>`. Use other reasonable prefixes like `fix/`, `docs/`.

## Work branches

- Branch from `develop`, keep it updated.
- Keep commits descriptive.
- Squash commits if it helps with readability
- Update AGENTS.md if making any changes to modules

## PRs
- Open against develop (only `hotfixes` are allowed to be bypassed directly to main)
- Ensure CI (build/tests/etc.) is green before requesting review
- Reference related issue