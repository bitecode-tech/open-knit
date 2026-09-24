## OCR Module

### What this module is

The OCR module stores user-owned OCR instructions, executes OCR extraction through pluggable providers, persists OCR provider configuration, and stores OCR execution results with outcome metadata in the `ocr` schema.

### Domain scope

- Owned capabilities: OCR provider configuration, user OCR instruction management, OCR execution against uploaded files, OCR result persistence, provider-level file validation.
- Owned entities/value objects: `OcrInstruction`, `OcrResult`, `OcrProviderConfig`, OCR DTOs, provider enums, OCR status enum, provider adapter request/response contracts.
- Non-owned areas: file storage, AI agent/chat flows, user identity lifecycle, frontend presentation.
- Boundary rules: the module depends only on `_common`; user ownership is represented by raw `UUID` values, and the shared `SimpleOpenAiClient` is consumed from `_common`.

### Core flows

1. Save OCR instruction
    - Trigger: authenticated request to `/ocr/instructions`.
    - Steps: resolve current user UUID, persist instruction title and instruction text.
    - Output: saved instruction DTO.
    - Failure/edge cases: invalid payload, unknown instruction on update/delete.
2. Execute OCR
    - Trigger: authenticated request to `/ocr/results`.
    - Steps: resolve user UUID, load saved instruction or use ad hoc text, validate requested provider and uploaded file against provider validator, call provider adapter with exact instruction text snapshot and file content, persist final OCR result row.
    - Output: saved OCR result DTO with success or error outcome.
    - Failure/edge cases: missing provider config, unsupported file type, upstream OCR error, missing instruction, empty file.
3. List user OCR results
    - Trigger: authenticated request to `/ocr/results`.
    - Steps: query OCR result rows owned by caller, map entities to API DTOs.
    - Output: paged user-owned OCR results.
    - Failure/edge cases: none beyond auth and pagination validation.
4. Admin OCR oversight
    - Trigger: admin requests to `/admin/ocr/results` and `/admin/ocr/providers`.
    - Steps: list all OCR results, delete OCR result rows, manage provider API keys.
    - Output: paged global OCR result list, deleted rows, provider config state.
    - Failure/edge cases: unknown result/provider rows return `404`.

### Data ownership

- Schema(s): `ocr`
- Main tables/entities: `ocr.ocr_instruction`, `ocr.ocr_result`, `ocr.ocr_provider_config`
- Audit/event tables: Not applicable because OCR stores final execution history directly in `ocr_result`.

### Public API surface

- Controllers/routes: `UserOcrController` on `/ocr`, `AdminOcrController` on `/admin/ocr`, `AdminOcrProviderConfigController` on `/admin/ocr/providers`
- Consumed events/commands: Not applicable
- Emitted events/commands: Not applicable
- Exposed facades/interfaces: `OcrProviderAdapter`

### Integrations and dependencies

- Internal module dependencies: `_common` for auth utilities, base entities, access annotations, and shared OpenAI client.
- External integrations: OpenAI Responses API through shared `_common` clients/utilities (`SimpleOpenAiClient`, `OpenAiFilesClient`, `OpenAiUsageMetricsResolver`).
- Communication style (event-driven or direct facade): direct internal service orchestration only.

### Class and Type Catalog

#### config

- `OcrFlywayMigrationConfig`: registers Flyway migration module for the `ocr` schema.
- `OcrModuleConfiguration`: enables typed OCR properties.
- `OcrProperties`: typed OCR provider defaults and OpenAI model configuration.

#### controller

- `UserOcrController`: user/admin-own OCR instruction and OCR result execution/list endpoints.
- `AdminOcrController`: admin OCR result list and delete endpoints.
- `AdminOcrProviderConfigController`: admin OCR provider configuration endpoints.

#### service

- `OcrInstructionService`: CRUD for user-owned OCR instructions.
- `OcrProviderConfigService`: CRUD and initialization for OCR provider API keys.
- `OcrResultService`: non-blocking OCR execution orchestration and OCR result persistence.

#### handler

- Not applicable because the module does not use command or event handlers.

#### repository

- `OcrInstructionRepository`: owner-scoped OCR instruction persistence.
- `OcrResultRepository`: OCR result persistence with owner/admin queries.
- `OcrProviderConfigRepository`: provider config persistence.

#### model/entity

- `OcrInstruction`: persisted user-owned OCR instruction.
- `OcrResult`: persisted OCR execution result with exact instruction snapshot.
- `OcrProviderConfig`: persisted provider API key configuration.

#### model/dto|command|event

- `OcrInstructionDetails`: OCR instruction DTO.
- `OcrResultDetails`: OCR result DTO.
- `RunOcrData`: execution command carrying file and instruction snapshot.
- `RunOcrResponse`: provider OCR text response with optional provider usage metrics.
- `CreateOcrInstructionRequest`, `UpdateOcrInstructionRequest`, `RunOcrRequest`, `UpdateOcrProviderConfigRequest`: module request DTOs.
- `OcrProviderType`, `OcrResultStatus`: OCR enums.

#### shared contracts (if any)

- `OcrProviderAdapter`: provider abstraction for OCR execution and validation.
- OpenAI file uploads are delegated to shared `_common` infrastructure before OCR requests reference uploaded `file_id` values for PDF inputs.

#### utils (if any)

- `OcrMapper`: MapStruct mapper for OCR entities and DTOs.

### Configuration

- `bitecode.ocr.open-ai.model`: OpenAI model used for OCR execution.
- Migration schema/location: `classpath:db/migration/ocr`

### Testing notes

- Main test classes: unit tests should cover provider adapter logic and validation; integration tests should cover user/admin OCR endpoints and provider config management.
- Must-cover scenarios: instruction ownership, OCR result ownership, provider file validation, result persistence for success/error, admin global result access and deletion.
- Special setup: integration tests require Docker/Testcontainers for PostgreSQL; provider unit tests should mock the shared OpenAI client.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
