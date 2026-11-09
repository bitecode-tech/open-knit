# CamelCase HTTP contract guidelines (working draft)

Updated from the documents pilot and module-wide guard. Apply to internal frontend ↔ backend JSON contracts only.

1. Use lower camelCase property names in Java request/response DTOs and TypeScript request/response types. Let Spring/Jackson defaults emit and consume those names.
2. Keep `spring.jackson.property-naming-strategy` at `LOWER_CAMEL_CASE`; integration tests should use the same strategy as production.
3. Do not use Axios request/response interceptors to rewrite JSON property names. Send typed request objects and consume typed response objects directly.
4. For each endpoint with JSON input/output, add a boundary test that asserts camelCase property names and rejects the corresponding snake_case spelling for at least representative multiword fields. Test each endpoint; don't infer coverage from a shared DTO alone.
5. For multipart and binary endpoints, check the route, media behavior, and any JSON metadata separately. Do not run JSON key conversion over FormData, File, Blob, or binary response bodies.
6. Keep third-party payload fields exact to the external provider contract. Put aliases such as `client_secret` or `workflow_id` at the provider adapter only; do not use them in internal module DTOs unless the endpoint itself intentionally implements the external provider API.
7. Inspect controller routes, frontend clients and direct Axios calls, DTOs/types, validation error maps, query parameter construction, common HTTP config, Jackson setup, test fixtures, and dependencies before declaring a module complete.
8. Remove `snakecase-keys`, response `camelcase-keys`, and related conversion helpers only after all internal client construction paths and provider exceptions have been reviewed.

## Pilot observations: documents

- Backend controllers emit `DocumentDetails` as camelCase (`userId`, `fileSize`, `fileType`, `storageType`) through the production Jackson config.
- Frontend `Document` type already uses these fields. Both clients use authenticated Axios creation; that helper was the path that applied the key converter.
- Backend integration assertions plus frontend tests cover list, detail, upload, download, and delete for user/admin clients. JSON response assertions reject representative snake_case keys; binary endpoints assert Blob/download behavior.
- Frontend had no unit test runner. Added Vitest and a minimal client contract suite. Keep these tests focused on HTTP contract behavior.
- The shared integration test config was overriding the app mapper to snake_case; align it with production as part of the first module pilot.

## Module-wide guard observations

- Each HTTP-owning backend module has a module-local guard that enumerates handler methods and recursively inspects request/response DTO properties. The root inventory test also discovers every `@RestController` in feature module packages and fails if a controller is omitted. It checks explicit query/path/header/cookie/multipart parameter names.
- Do not skip map-shaped API responses without reviewing their runtime keys. Prefer response records with declared camelCase fields for stable maps. For dynamic dataset keys, normalize at the internal data boundary and test representative database labels.
- Each HTTP-owning frontend module has a module-local test that scans all client and module source files, declared types, JSON object properties, HTTP query string keys, `FormData.append` names, and `URLSearchParams.set` names. Keep clients typed instead of `any` where a response model exists.
- Source guards prove declared property casing for each discovered endpoint/client, but do not execute every endpoint. Pair them with focused runtime HTTP assertions for representative JSON flows and retain full integration suites for route behavior. Explicitly mark provider protocols, binary responses, and configurable external URLs as separate boundaries.
- Documents has endpoint-specific runtime assertions; identity auth/user has existing integration coverage; statistics in identity and transaction have response serialization plus frontend client contract checks. Extend runtime endpoint assertions when adding a module or changing a high-risk contract.
