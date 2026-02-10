## AI Module

### What this module is

AI provides configurable AI agents, chat session/message logging, attachment extraction (text/image/audio/document), RAG document storage with vector references, provider
configuration, and admin/user/open endpoints for AI chat operations.

### Domain scope

- Owned capabilities:
    - AI agent configuration (models, prompts, strategy, access controls)
    - chat handling (sync and streaming)
    - chat session/message storage and analytics
    - provider config management (OpenAI/Ollama/Azure)
    - document knowledge ingestion/removal and vector-store integration
    - recording transcription and ChatKit client-secret minting
- Owned entities/value objects:
    - `ai.ai_agent`, `ai.ai_agent_exemplary_prompt`, `ai.ai_services_provider_config`
    - `ai.chat_session`, `ai.chat_session_message`
    - `ai.vector_document_ref` plus vector-store rows (configured as `ai.vector_document_store`)
- Non-owned areas:
    - business transaction/payment/wallet identity domains
- Boundary rules:
    - AI module uses other modules primarily through schema context read (admin agent strategy) and shared contracts only
    - provider API keys are managed in module config entity and must not be exposed

### Core flows

1. Open/public chat flow
    - Trigger: `/open/ai/agents/{uuid}/chat` or `/chat/stream`.
    - Steps: optional password check, resolve agent strategy, process attachments, run provider client, optionally log user/agent messages.
    - Output: agent response payload or SSE stream.
    - Failure/edge cases: wrong password, missing agent/provider config, unsupported attachment type.
2. Authenticated user/admin chat flow
    - Trigger: user `/ai/agents/{uuid}/chat` or admin `/admin/ai/agents/{uuid}/chat`.
    - Steps: resolve user id, execute strategy via `AiChatService`, persist session/messages when strategy requests logging.
    - Output: chat response and persisted chat history.
    - Failure/edge cases: strategy missing, invalid session context.
3. Agent configuration flow
    - Trigger: admin endpoints on `/admin/ai/agents`.
    - Steps: create/update/delete agents, update prompts/settings/password flags, enable/disable upload/recording features.
    - Output: persisted agent config state.
    - Failure/edge cases: unknown agent UUID, invalid provider/model values.
4. Knowledge document ingestion/removal (RAG)
    - Trigger: admin knowledge endpoints.
    - Steps: validate file type, extract text/chunks, store metadata refs, write/delete vector entries by document metadata filter.
    - Output: updated document references and vector store state.
    - Failure/edge cases: unsupported document, extraction error, provider/vector config issues.
5. Provider configuration flow
    - Trigger: `/admin/ai/providers`.
    - Steps: read provider rows, initialize missing providers on startup, update API keys, cache provider config.
    - Output: stable provider configuration records.
    - Failure/edge cases: missing provider row, invalid provider enum.
6. ChatKit session secret flow
    - Trigger: `POST /chatkit/session`.
    - Steps: resolve OpenAI provider key, choose workflow id, mint/refresh ChatKit client secret via OpenAI API.
    - Output: client secret for frontend ChatKit session.
    - Failure/edge cases: missing key/workflow, upstream API failure.
7. Admin dashboard SQL assistant flow
    - Trigger: agent strategy `AdminDashboardNavbarChatAgentStrategy` invocation.
    - Steps: generate safe SELECT query from prompt using schema context, execute query, optionally generate concise reasoning response.
    - Output: dataset or concise answer.
    - Failure/edge cases: invalid SQL generation, non-select request, query execution errors.

### Data ownership

- Schema(s): `ai`.
- Main tables/entities:
    - `ai.ai_agent` (`AiAgent`)
    - `ai.ai_agent_exemplary_prompt` (`AiAgentExemplaryPrompt`)
    - `ai.ai_services_provider_config` (`AiServicesProviderConfig`)
    - `ai.chat_session` (`ChatSession`)
    - `ai.chat_session_message` (`ChatSessionMessage`)
    - `ai.vector_document_ref` (`VectorDocumentRef`)
    - vector storage table `ai.vector_document_store` (through `PgVectorStore`)
- Audit/event tables:
    - no dedicated event-sourcing tables; chat sessions/messages act as interaction history.

### Public API surface

- Controllers/routes:
    - `OpenAiAgentController`: `/open/ai/agents`
        - `POST /{uuid}/password-check`
        - `GET /{uuid}`
        - `POST /{uuid}/chat`
        - `POST /{uuid}/chat/stream`
        - `POST /{uuid}/chat/transcribe`
    - `UserAiChatController`: `/ai/agents/{uuid}/chat`
        - `POST /`
    - `AdminAiChatController`: `/admin/ai/agents`
        - `POST /{uuid}/chat`
        - `POST /{uuid}/chat/transcribe`
        - `GET /{agentId}/sessions`
        - `GET /sessions`
        - `GET /sessions/stats`
        - `GET /sessions/{id}/stats`
        - `GET /sessions/{sessionId}/messages`
    - `AdminAgentConfigurationController`: `/admin/ai/agents`
        - `GET /`, `GET /{uuid}`, `POST /`, `PATCH /{uuid}`, `DELETE /{uuid}`
        - `PATCH /{uuid}/knowledge`, `GET /{uuid}/knowledge`, `POST /{uuid}/knowledge`, `DELETE /{uuid}/knowledge/{id}`
    - `AdminAiServicesProviderConfigurationController`: `/admin/ai/providers`
        - `GET /`, `GET /{provider}`, `PATCH /`
    - `ChatkitController`: `/chatkit/session` (`POST`)
- Consumed events/commands:
    - none from other modules.
- Emitted events/commands:
    - none via `_common` module-event contracts.
- Exposed facades/interfaces:
    - none; access is via module HTTP controllers.

### Integrations and dependencies

- Internal module dependencies:
    - `_common` base entities, auth annotations, utility classes.
- External integrations:
    - Spring AI model clients (`OpenAI`, `Ollama`, `Azure OpenAI`)
    - OpenAI Responses API and File API
    - OpenAI ChatKit session API
    - PgVector vector store with embeddings
    - Multipart document/image/audio parsing and transcription models
- Communication style (event-driven or direct facade):
    - direct HTTP APIs only in current module.

### Class and Type Catalog

#### config

- `AiAutoConfigurationExclusions`: disables default pgvector autoconfig to use custom setup.
- `AiFlywayMigrationConfig`: registers AI Flyway migration module.
- `AzureOpenAiConfig`: conditional Azure credential/client wiring.
- `CaffeineCacheConfig`: registers AI agent/provider caches.
- `OllamaConfig`: conditional Ollama API and embedding model wiring.
- `RagConfig`: provides text splitter bean for document chunking.

#### controller

- `OpenAiAgentController`: public/open AI endpoints (password-check, chat, stream, transcribe, details).
- `UserAiChatController`: authenticated user chat endpoint.
- `AdminAiChatController`: admin chat + sessions analytics endpoints.
- `AdminAgentConfigurationController`: admin CRUD for agents + knowledge document management.
- `AdminAiServicesProviderConfigurationController`: admin provider config endpoints.
- `ChatkitController`: frontend chatkit session secret endpoint.

#### service

- `AiAgentService`: agent CRUD, caching, strategy resolution, and access-password checks.
- `AiChatService`: main chat orchestration, session/message persistence, streaming support.
- `AiServicesProviderConfigService`: provider config CRUD with cache and startup initialization.
- `AgentKnowledgeService`: vector-document refs CRUD and vector-store add/delete synchronization.
- `FileDataExtractorService`: attachment validation/extraction/transcription/upload preparation.
- `ChatkitSessionService`: OpenAI ChatKit secret minting service.

#### strategy and agent runtime

- `AiAgentStrategy`: strategy contract for agent response generation.
- `StreamingAiAgentStrategy`: streaming-capable strategy contract.
- `LoggingAiExtension`: marker contract exposing whether strategy should persist chat logs.
- `UserConfigurableAgentStrategy`: default configurable strategy using completions/responses clients.
- `AdminDashboardNavbarChatAgentStrategy`: SQL-assistant strategy for admin dashboard prompts.

#### client and provider

- `AiMessageClient`: client abstraction for provider messaging.
- `AbstractMessageClient`: shared client base for building prompts/provider calls.
- `CompletionsApiMessageClient`: completions-style provider client.
- `ResponsesApiMessageClient`: OpenAI Responses API client wrapper.
- `ChatProviderBuilder`: provider/client/options builder across OpenAI/Ollama/Azure.
- `ChatProviderBuilder.ClientConfig<T>`: chat client config record.
- `ChatProviderBuilder.RecordingClientConfig<T>`: recording API config record.
- `VectorStoreFactory`: builds vector-store instance per provider config.
- `OpenAiFileApiClient`: OpenAI file upload client for assistant/file attachments.
- `SimpleOpenAiClient`: minimal custom WebClient-based OpenAI client for responses/chatkit.
- `SimpleOpenAiClient.StreamChunk`: parsed streaming chunk record.

#### repository

- `AiAgentRepository`: AI agent persistence and fetch with docs.
- `AiServicesProviderConfigRepository`: provider config repository.
- `ChatSessionRepository`: chat session repository with custom stats queries + last-response updates.
- `CustomChatSessionRepository`: custom stats query contract.
- `CustomChatSessionRepositoryImpl`: QueryDSL implementation of stats/session analytics.
- `ChatSessionMessageRepository`: chat message repository by session.
- `VectorDocumentRefRepository`: vector document reference repository.

#### model/entity

- `AiAgent`: core AI agent configuration entity.
- `AiAgentExemplaryPrompt`: example prompt entries linked to agent.
- `AiServicesProviderConfig`: provider config entity (provider + API key).
- `ChatSession`: chat session aggregate keyed by external session id.
- `ChatSessionMessage`: persisted chat message row.
- `VectorDocumentRef`: metadata ref for ingested knowledge files.

#### model/mapper

- `AiAgentMapper`: maps agent entities to no-auth/public details.
- `ChatSessionMapper`: maps chat session/message entities to details projections.

#### model/request|response|data|projection|enum

- `UpdateAiAgentConfigRequest`: partial update request for agent config fields.
- `UpdateAiServicesProviderRequest`: provider config update request.
- `ChatkitSessionRequest`: chatkit secret request payload.
- `ChatkitSessionResponse`: chatkit secret response payload.
- `NoAuthAiAgentDetails`: public agent details projection.
- `ChatSessionWithCountDetails`: session details with message count.
- `ChatSessionMessageDetails`: chat session message details projection.
- `AgentChatSession`: agent session projection.
- `AiAgentSessionStats`: single session stats projection.
- `AiAgentSessionsStats`: aggregate session stats projection.
- `ChatSessionWithUserMessageCount`: projection for user-message counts per session.
- `AiAgentRequestData`: base chat request payload with session/user/attachments.
- `EnrichedAiAgentRequestData`: enriched request with history/last-response metadata.
- `AiAgentChatResponseData`: base chat response payload.
- `UserChatResponse`: user-facing chat response specialization.
- `StreamingResponse`: streaming payload wrapper (`Flux` chunks + response id).
- `AudioTranscriptionResponse`: transcription response DTO.
- `DatabaseQueryDeducingAgentCallAnswer`: SQL-assistant intermediate decision DTO.
- `AiChatUi`: enum for supported chat UI modes.
- `ChatMessageUserType`: enum for message direction (`USER`, `AGENT`, etc.).
- `AiServicesProviderType`: enum for provider type selection and api-key requirements.

#### util

- `DocumentUtils`: extracts textual content from supported uploaded document formats.
- `LoggingUtils`: HTTP/WebClient logging helpers for AI outbound calls.

### Configuration

- Flyway migration path: `classpath:db/migration/ai`.
- AI provider config is persisted in `ai_services_provider_config` and cached.
- `chatkit.*`: chatkit session secret/workflow/org/project settings.
- `SPRING_AI_OLLAMA_*`: Ollama enablement/base URL/auth/model configuration.
- `AZURE_*`: Azure Foundry credential and endpoint settings.
- cache names:
    - `ai:agent`
    - `ai:provider-config`

### Testing notes

- Main test classes:
    - no module test classes are currently present under `backend/modules/ai/src/test/java`.
- Must-cover scenarios (when adding/expanding tests):
    - agent config CRUD and cache behavior
    - chat sync and stream paths with attachment handling
    - knowledge document add/remove and vector-store synchronization
    - provider config update and startup provider bootstrap behavior
    - chatkit secret minting failure/success paths
- Special setup:
    - tests should isolate provider external calls (OpenAI/Stripe-like stubs for AI providers) and avoid live network dependency.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
