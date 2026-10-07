## Document Module

### What this module is

The document module stores uploaded files and their metadata. It owns physical storage orchestration through pluggable adapters and persists document records in the `document` schema.

### Domain scope

- Owned capabilities: upload documents, list documents, read document details, download document binaries, delete documents, choose configured storage backend, keep file metadata and ownership.
- Internal-only metadata: stored filenames remain persistence/storage details and must not be exposed through public API DTOs.
- Owned entities/value objects: `Document`, `DocumentDetails`, `DocumentStorageType`, storage adapter request contracts.
- Non-owned areas: user identity lifecycle, authorization rules implementation, frontend clients, cross-module business usage of documents.
- Boundary rules: the module only depends on `_common`; user ownership is stored as raw `UUID` and not as a JPA relation to the identity module.

### Core flows

1. Upload document
    - Trigger: authenticated user or admin sends multipart upload to `/documents` or `/admin/documents`.
    - Steps: resolve current user UUID, validate files, stage each multipart upload to a temporary file while computing its checksum, derive stored filename, store the file through the configured adapter, persist metadata, and remove the temporary file.
    - Output: persisted `DocumentDetails` records for uploaded files.
    - Failure/edge cases: missing filename, empty file payload, missing storage adapter configuration, storage write failure, DB save failure after storage write triggers cleanup.
2. List user documents
    - Trigger: authenticated request to `/documents`.
    - Steps: resolve current user UUID, query only rows owned by that user, map entities to API DTOs.
    - Output: paged list of caller-owned documents.
    - Failure/edge cases: none beyond auth and pagination validation.
3. Read or download document
    - Trigger: authenticated request to `/documents/{documentId}` or `/documents/{documentId}/download`, or admin request to `/admin/documents/{documentId}` or `/admin/documents/{documentId}/download`.
    - Steps: resolve owner scope if needed, load metadata row, then stream binary content from the matching adapter to the HTTP response without materializing the full document in heap.
    - Output: `DocumentDetails` metadata or binary file content with inline PDF support.
    - Failure/edge cases: user access to another user's document returns `404`, missing document returns `404`, storage read failure aborts download.
4. Admin list and delete documents
    - Trigger: admin request to `/admin/documents` or `/admin/documents/{documentId}`.
    - Steps: query all documents for listing; on delete load metadata, remove binary content through the matching adapter, delete metadata row.
    - Output: paged list of all documents or successful deletion.
    - Failure/edge cases: deleting unknown document returns `404`, adapter mismatch or storage delete failure aborts metadata deletion.
5. User delete own document
    - Trigger: authenticated request to `/documents/{documentId}`.
    - Steps: resolve current user UUID, load row by document UUID and owner UUID, remove binary content, delete metadata row.
    - Output: successful deletion of caller-owned document.
    - Failure/edge cases: deleting another user's document returns `404`.

### Data ownership

- Schema(s): `document`
- Main tables/entities: `document.document`
- Audit/event tables: Not applicable because this module currently stores only document metadata and binary content references.

### Public API surface

- Controllers/routes: `UserDocumentController` on `/documents`, `AdminDocumentController` on `/admin/documents`, both exposing list, details, download, upload, and delete operations within their access scope
- Consumed events/commands: Not applicable
- Emitted events/commands: Not applicable
- Exposed facades/interfaces: `DocumentStorageAdapter` for internal storage implementations

### Integrations and dependencies

- Internal module dependencies: `_common` for auth utilities, base entities, and access annotations.
- External integrations: local filesystem and generic S3-compatible object storage.
- Communication style (event-driven or direct facade): direct internal service orchestration only; integration tests also consume identity-owned auth test configuration from the identity module test artifact.

### Class and Type Catalog

#### config

- `DocumentFlywayMigrationConfig`: registers Flyway migration module for the `document` schema.
- `DocumentProperties`: typed storage configuration for local and S3 adapters.

#### controller

- `AdminDocumentController`: admin API for list, upload private documents, and delete any document.
- `UserDocumentController`: authenticated API for upload, list, and delete of caller-owned documents.

#### service

- `DocumentService`: transaction boundary for document upload, listing, and deletion flows.

#### handler

- Not applicable because the module does not use command or event handlers.

#### repository

- `DocumentRepository`: JPA access for document metadata with admin and owner-scoped queries.

#### model/entity

- `Document`: persisted document metadata row with owner UUID, checksum, size, storage type, and stored filename.

#### model/dto|command|event

- `DocumentDetails`: API DTO for document metadata exposed to clients, excluding internal stored filename values.
- `DocumentDownload`: internal download descriptor containing response metadata and storage coordinates; the file bytes are streamed separately.
- `DocumentStorageType`: enum describing the active binary storage backend.
- `StoreDocumentRequest`: storage adapter command payload with owner UUID, stored filename, and file bytes.

#### shared contracts (if any)

- `DocumentStorageAdapter`: contract implemented by each binary storage adapter for file-based storage, streaming downloads, and delete operations.

#### utils (if any)

- `DocumentMapper`: maps `Document` entities to `DocumentDetails` DTOs.

### Configuration

- `bitecode.document.storage.default-storage-type`: selects the adapter used for new uploads.
- `bitecode.document.storage.local.base-path`: writable filesystem base path for local storage.
- `bitecode.document.storage.s3.bucket`: S3-compatible bucket name used by the S3 adapter.
- `bitecode.document.storage.s3.region`: S3 region sent to the SDK.
- `bitecode.document.storage.s3.endpoint`: optional custom endpoint for AWS-compatible providers like DigitalOcean Spaces.
- `bitecode.document.storage.s3.access-key`: optional static access key for the S3 client.
- `bitecode.document.storage.s3.secret-key`: optional static secret key for the S3 client.
- `bitecode.document.storage.s3.force-path-style`: toggles path-style addressing for S3-compatible providers.
- Migration schema/location: `classpath:db/migration/document`

### Testing notes

- Main test classes: `DocumentControllerTest` in `src/test/integration` for admin and user endpoint coverage with local storage, `DocumentIntegrationTest` in `src/test/integration` for shared cleanup and test wiring, `S3DocumentStorageAdapterTest` in `src/test/unit` for mocked S3 adapter behavior.
- Must-cover scenarios: streamed upload metadata and checksum persistence, streamed downloads for user and admin endpoints, owner scoping, admin access control, cleanup on delete and temporary files, cleanup of local test storage between runs, and S3 object key generation plus bucket validation.
- Special setup: current integration tests use local storage only and require Docker/Testcontainers for PostgreSQL; S3 is covered by unit tests with mocked SDK behavior.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
