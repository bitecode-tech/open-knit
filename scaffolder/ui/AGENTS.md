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
- Follow semantic versioning: increment the patch for fixes, the minor version for backward-compatible features or minor product changes, and the major version for breaking changes. Reset lower-order segments when incrementing a higher segment.
- The current starting version is `0.1.1`.
