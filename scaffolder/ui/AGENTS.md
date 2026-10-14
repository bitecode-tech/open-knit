# Scaffolder UI Agent Instructions

## TypeScript checks (required)

- ALWAYS run a TypeScript typecheck before finishing any task that touches code in this directory.
- Use this command and include any relevant errors or confirmations in your response:
    - `pnpm run typecheck`

## Notes

- If typecheck fails, fix errors or ask for guidance before finalizing.
- When making SEO-relevant changes to major public pages, update `public/sitemap.xml` and change the `lastmod` values for every affected URL.

## Scaffolder release version

- Every deployment to `main` must bump the scaffolder version in `../package.json`; keep the version displayed in the UI sourced from that package version.
- For ordinary minor changes, bump only the minor version segment and reset the patch to `0` (for example, `0.2.4` to `0.3.0`); do not increment the patch segment on its own.
- Treat a jump to a new minor version series (for example, `0.2.x` to `0.3.x`) as a major release only when the user explicitly identifies or directs it as major. Do not infer or make a major version jump independently.
- The current starting version is `0.1.1`.
