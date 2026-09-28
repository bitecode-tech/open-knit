# Core Technologies

- **Scaffolder UI:** React and TypeScript, Vike file-based routing, Vite, and Tailwind CSS. See [UI dependencies](../ui/package.json), [Vike config](../ui/src/pages/+config.ts), and [Vite plugins](../ui/vite.config.ts).
- **Scaffolder runtime:** Node.js and pnpm workflows are documented in the [scaffolder README](../README.md); the HTTP API is implemented in TypeScript. Runtime module configuration comes from the [ScaffolderService](../src/services/ScaffolderService.ts).
- **Builder:** `/builder` owns local mode, bundle, and module selection state and assembles the existing `/api/scaffold` download request. Its Generator header and responsive three-panel interface are page-level UI; landing and module routes retain their separate headers. A successful local ZIP download remains unverified because `/api/scaffold` returned HTTP 504, although mocked request payloads were checked.
- **UI verification:** `ui/AGENTS.md` requires `pnpm run typecheck` after UI code changes and sitemap `lastmod` updates for SEO-relevant public-page changes. See [UI instructions](../ui/AGENTS.md) and [sitemap](../ui/public/sitemap.xml).

The parent repository's Java/Spring and React/Vite summaries describe the generated OpenKnit platform. Keep those distinct from the scaffolder UI's stack above.
