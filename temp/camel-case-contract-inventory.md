# Frontend/backend contract inventory for camelCase transition

Scope: internal frontend ↔ Spring REST JSON naming only. This inventory records the Phase 1 discovery and the transition changes made in this session. Provider-owned wire formats (Stripe, OpenAI, Chatkit) are recorded as special boundaries and should not be changed without provider contract evidence.

## Shared settings and cross-cutting boundaries

| Surface | Current behavior / location | Transition implication |
|---|---|---|
| Spring production Jackson | `backend/src/main/resources/application.yaml` sets `spring.jackson.property-naming-strategy: LOWER_CAMEL_CASE` | Already the target convention. Confirm this is the effective global ObjectMapper behavior. |
| Spring ObjectMapper customization | `backend/modules/_common/src/main/java/bitecode/modules/_common/config/JacksonObjectMapperConfig.java` | Shared customization point; confirm no independent naming strategy is imposed here. |
| Spring integration-test ObjectMapper | `BaseIntegrationTest.java` and shared integration YAML previously used `SNAKE_CASE`; both now use `LOWER_CAMEL_CASE` to match production. |
| Frontend Axios configuration | `frontend/modules/_common/config/AxiosConfig.ts`: base URL and admin URL; the former deep request/response key converters are removed. `configureAxios` retains `qs` query serialization. | Internal JSON request and response bodies now pass through with camelCase property names. |
| Client adoption | Former converter callers were `AuthClient`, `UserClient`, `NoAuthAiClient`, plus clients using `AuthService.createAuthenticatedClientInstance`. All now use no key conversion; query serialization remains shared. | Frontend module payloads match their camelCase TypeScript models. |
| Frontend dependency/config references | `frontend/package.json`, `frontend/pnpm-lock.yaml`; the `snakecase-keys` and `camelcase-keys` dependencies are removed by this transition | Remove converter packages and lockfile entries only once no consumers remain. |
| Validation errors | `GlobalExceptionHandlerConfig.handleValidationException` returns a map keyed by Java DTO field name | Error property names follow DTO property/Jackson mapping behavior; include in endpoint checks. |
| Scaffolder HTTP boundary | `scaffolder/src/server.ts` owns `/health`, `/api/modules`, `/api/wishlist`, `/api/scaffold`, and `/api/mcp/artifacts/{token}`; `scaffolder/ui/src/clients/HttpClient.ts` and `ModuleAvailabilityClient.ts` call these endpoints. Its payload properties are already camelCase (`systemName`, `counterName`, `availableModules`, `moduleAliases`). | Separate Node/Express surface (not a Spring module); no case converter was found. `/api/mcp` is a provider protocol boundary and should retain protocol-defined JSON-RPC names. |

## Module inventory

### `_common` (shared contract/runtime)

- Backend: shared Jackson config above; `GlobalExceptionHandlerConfig`; `BaseIntegrationTest` and test YAML naming overrides.
- Frontend: `modules/_common/config/AxiosConfig.ts`, `AxiosUtil.ts`, `PaginationUtils.ts`; shared Axios config is imported by module clients.
- Other cross-points: common DTOs/types are under `frontend/modules/_common/types/`; backend shared request/response types are distributed under each owning module.

### `ai`

- Backend REST controllers: `AdminAgentConfigurationController`, `AdminAiChatController`, `AdminAiServicesProviderConfigurationController`, `ChatkitController`, `OpenAiAgentController`, `UserAiChatController` under `backend/modules/ai/src/main/java/bitecode/modules/ai/`.
- Frontend HTTP clients: `frontend/modules/ai/clients/AdminAiClient.ts`, `NoAuthAiClient.ts`; some UI/hooks make HTTP calls directly (`NavbarAiChat.tsx`, `components/chat/user-configurable-chat/chat-provider/UserConfigurableChatDefault.tsx`); `ChatkitChat.tsx` also constructs provider-specific payloads.
- DTOs / contract models: `backend/modules/ai/src/main/java/bitecode/modules/ai/model/` and `model/data/{request,response}/`; frontend module `types/` and client method types.
- Chatkit internal REST request/response records now use camelCase (`clientSecret`, `workflowId`, `user`). `SimpleOpenAiClient` maps these into provider-required keys when it calls OpenAI. Preserve snake_case only at that provider boundary; Stripe/OpenAI fixtures and provider payloads remain external contracts.

### `document`

- Backend REST controllers: `AdminDocumentController`, `UserDocumentController` under `backend/modules/document/src/main/java/bitecode/modules/document/`.
- Frontend HTTP clients: `frontend/modules/document/clients/http/AdminDocumentClient.ts`, `UserDocumentClient.ts`; orchestration in `services/DocumentService.ts`; binary download handling in `utils/documentDownload.ts`.
- DTOs / contract models: backend document controller/API models under `model/` plus `service/storage/StoreDocumentRequest.java`; frontend types under `frontend/modules/document/types/`.
- Binary/multipart boundaries: uploads use FormData and downloads return Blob; these remain outside JSON property naming.

### `identity` (backend Java package `bitecode.modules.auth`)

- Backend REST controllers: `AuthController`, `AdminAuthController`, `UserController`, `AdminUserController` under `backend/modules/identity/src/main/java/bitecode/modules/auth/`.
- Frontend HTTP clients: `frontend/modules/identity/auth/clients/http/AuthClient.ts`; `frontend/modules/identity/user/clients/http/UserClient.ts`, `AdminUserClient.ts`; auth client/interceptor setup in `services/AuthService.ts`.
- DTOs / contract models: backend `auth/**/model/{request,response}/`; frontend identity module `types/`.
- Error boundary: validation errors for request DTO fields also return through shared exception advice.

### `ocr`

- Backend REST controllers: `AdminOcrController`, `AdminOcrProviderConfigController`, `UserOcrController` under `backend/modules/ocr/src/main/java/bitecode/modules/ocr/`.
- Frontend HTTP client: `frontend/modules/ocr/clients/OcrClient.ts`; authenticated Axios creation is routed through `AuthService`.
- DTOs / contract models: backend `model/request/`, `model/data/`; frontend `frontend/modules/ocr/types/`.
- Special boundaries: OCR file upload is multipart/FormData; exclude it from JSON key conversion checks while checking the JSON response metadata.

### `payment`

- Backend REST controllers: `AdminPaymentController`, `AdminSubscriptionController`, `SubscriptionController` under `backend/modules/payment/src/main/java/bitecode/modules/payment/`.
- Frontend HTTP clients: `frontend/modules/payment/clients/http/AdminPaymentClient.ts`, `AdminSubscriptionClient.ts`, `SubscriptionClient.ts`; service/request types under `services/` and `types/`.
- DTOs / contract models: backend `payment/model/{request,response}/`, `subscription/model/{request,response}/`.
- Special external boundary: Stripe webhook/provider payload handling in `payment/provider/stripe/StripeWebhookHandler.java` and provider integration code; preserve provider field names at that boundary.

### `transaction`

- Backend REST controller: `AdminTransactionController` under `backend/modules/transaction/src/main/java/bitecode/modules/transaction/`.
- Frontend HTTP client: `frontend/modules/transaction/clients/http/TransactionClient.ts`.
- DTOs / contract models: backend transaction API models under `model/`; frontend module `types/`.

### `wallet`

- No REST controller or frontend HTTP client was found in the current module surface. Backend module exists at `backend/modules/wallet/` and may expose non-HTTP/event contracts; revisit only if graph/file review finds an internal JSON boundary used by frontend.

## Endpoint and client checklist

- Backend application module roots in scope: `_common`, `ai`, `document`, `identity`, `ocr`, `payment`, `transaction`, `wallet`.
- Controllers indexed by graph: 19 (AI 6, document 2, identity 4, OCR 3, payment 3, transaction 1), with 79 internal handler mappings in the second pass; the Stripe webhook is an additional provider endpoint boundary.
- Frontend clients indexed: 12 (AI 2, document 2, identity 3, OCR 1, payment 3, transaction 1); direct Axios UI calls and the scaffolder HTTP client are additional paths to classify. The shared key converters were removed across all clients in this transition.
- The backend inventory guard now compares its 19 internal controllers against all discovered module `@RestController` classes and inspects each annotated handler's JSON types and HTTP parameter names. Stripe remains explicitly classified as an external provider endpoint.
- Frontend guards scan every client file and module source, including direct Axios/fetch calls and multipart/query parameter keys. These are source-contract checks, not live requests to every route.

## Required second-pass checks

1. Compare every backend `@RestController` and provider webhook endpoint against the module list.
2. Compare every frontend Axios instance/direct `axios.*` call against each client listing, including auth-created instances and AI UI calls.
3. Trace request/response DTOs, query/page parameter objects, validation error maps, multipart and Blob exceptions.
4. Identify every Jackson mapper/naming override and every frontend key conversion implementation/dependency. Current searches found no application-internal snake-case converter/strategy after the transition; provider DTOs remain explicit.
5. Keep external Stripe/OpenAI/Chatkit payload formats distinct from internal REST JSON.
6. Keep the unresolved routes and field-level coverage gaps below visible during follow-up work.

## Route manifest (internal application surface)

Routes are grouped by controller; `{}` denotes a path variable. These are route paths and methods only, not a field-level request/response schema.

- **AI**
  - `AdminAgentConfigurationController`: `GET/POST /api/admin/ai/agents`; `GET/PATCH/DELETE /api/admin/ai/agents/{}`; `GET/PATCH/POST /api/admin/ai/agents/{}/knowledge`; `DELETE /api/admin/ai/agents/{}/knowledge/{}`.
  - `AdminAiChatController`: `GET /api/admin/ai/agents/sessions`; `GET /api/admin/ai/agents/sessions/stats`; `GET /api/admin/ai/agents/sessions/{}/stats`; `GET /api/admin/ai/agents/sessions/{}/messages`; `GET /api/admin/ai/agents/{}/sessions`; `POST /api/admin/ai/agents/{}/chat`; `POST /api/admin/ai/agents/{}/chat/transcribe`.
  - `AdminAiServicesProviderConfigurationController`: `GET /api/admin/ai/providers`; `PATCH /api/admin/ai/providers`; `GET /api/admin/ai/providers/{}`.
  - `ChatkitController`: `POST /api/chatkit/session` (provider contract payload; separate exception).
  - `UserAiChatController`: `POST /api/ai/agents/{}/chat`.
  - `OpenAiAgentController`: `GET /api/open/ai/agents/{}`; `POST /api/open/ai/agents/{}/chat`; `POST /api/open/ai/agents/{}/chat/stream`; `POST /api/open/ai/agents/{}/chat/transcribe`; `POST /api/open/ai/agents/{}/password-check`.
- **Document** (`AdminDocumentController`, `UserDocumentController`): each exposes `GET/POST /api[/admin]/documents`; `GET/DELETE /api[/admin]/documents/{}`; `GET /api[/admin]/documents/{}/download`.
- **Identity**
  - `AuthController`: `POST /api/oauth/login`, `POST /api/oauth/logout`, `POST /api/oauth/tokens/access` (refresh token is supplied in an HttpOnly cookie).
  - `AdminAuthController`: `DELETE /api/admin/oauth/tokens/refresh`.
  - `UserController`: `GET /api/users/self`; `POST /api/users`; `POST /api/users/confirmations`; `POST /api/users/confirmations/{}`; `PUT /api/users/mfa`; `GET/PATCH /api/users/data`; `POST /api/users/passwords/recovery`; `POST /api/users/passwords/recovery/{}`; `PUT /api/users/passwords`.
  - `AdminUserController`: `GET /api/admin/users`; `POST /api/admin/users/invite`; `GET /api/admin/users/statistics`.
- **OCR**
  - `UserOcrController`: `GET/POST /api/ocr/instructions`; `PATCH/DELETE /api/ocr/instructions/{}`; `GET/POST /api/ocr/results`.
  - `AdminOcrController`: `GET /api/admin/ocr/results`; `DELETE /api/admin/ocr/results/{}`.
  - `AdminOcrProviderConfigController`: `GET /api/admin/ocr/providers`; `PATCH /api/admin/ocr/providers`; `GET /api/admin/ocr/providers/{}`.
- **Payment**
  - `AdminPaymentController`: `GET /api/admin/payments`; `GET /api/admin/payments/{}`.
  - `AdminSubscriptionController`: `GET/POST /api/admin/subscriptions`; `GET/POST /api/admin/subscriptions/plans`; `GET /api/admin/subscriptions/plans/active-count`; `PATCH /api/admin/subscriptions/plans/{}`.
  - `SubscriptionController`: `GET/POST /api/subscriptions`; `PUT /api/subscriptions`; `DELETE /api/subscriptions/{}`.
  - Provider webhook: `POST /api/payments/webhooks/stripe` (`StripeWebhookHandler`; external Stripe request shape).
- **Transaction** (`AdminTransactionController`): `GET /api/admin/transactions`; `GET /api/admin/transactions/statistics`; `GET /api/admin/transactions/{}`.

The previously unresolved `/api/modules`, `/api/scaffold`, `/api/wishlist`, `/api/mcp/artifacts/{}`, and `/health` routes belong to the separate Node/Express scaffolder (`scaffolder/src/server.ts`); `/api/mcp` is MCP transport. The JSON request/response fields inspected there already use camelCase. Keep this surface listed separately from the 19 Spring controllers. Query routes are not affected by property naming as such, but their parameter-object creation and serialization must be checked in the corresponding frontend client.

## Gap review: independent second pass

An independent Explorer pass confirmed the module-level inventory: 19 backend controller classes and 12 frontend clients across `ai`, `document`, `identity`, `ocr`, `payment`, and `transaction`; `wallet` has no matching frontend module/client or REST controller surfaced. It confirmed production used `LOWER_CAMEL_CASE`, shared tests previously used `SNAKE_CASE`, and the shared frontend converter was attached through multiple paths. Source review corrected two first-pass details: `AuthService.addAuthorizationInterceptor` did call the converter, and `AuthController` exposes only login/logout/access-token routes (refresh uses the cookie), not a refresh-token HTTP route.

Remaining limits and distinctions:

- The stale graph route set included separate scaffolder endpoints; live source review attributed those to Node/Express and found existing camelCase fields. MCP JSON-RPC remains provider-protocol-owned.
- The route manifest is a route-to-controller inventory, not a complete field schema. Each of the six HTTP-owning modules has backend and frontend camelCase source guards. Backend guards enumerate handler methods, inspect nested DTOs and query/path/part names, and the root guard detects newly added controllers. Frontend guards walk every client and module source file, declared type, object property, and FormData/URLSearchParams key. These guards check declared contracts; they do not issue a live HTTP request for every route.
- Runtime contract coverage includes document flows, existing identity auth/user integration scenarios, shared Axios serialization, and focused identity/transaction statistics client/backend checks. Other modules rely on the per-endpoint source guards plus their existing integration/unit tests; they do not each have endpoint-by-endpoint camelCase HTTP assertions.
- Identity and transaction statistics were previously maps with uppercase keys while the UI read camelCase keys. They are now typed `AdminUserStatistics` and `TransactionStatistics` responses with camelCase fields, covered by backend serialization tests and frontend client tests.
- AI dashboard dataset keys come from SQL column labels. The tested row-map insertion path converts snake/upper/hyphen labels before they enter the internal response dataset, and preserves already lower-camel labels. This conversion is local to the database result boundary; provider payload mappings remain separate.
- A shared integration test uses the Spring-managed `ObjectMapper` from a booted test application context to write and read a multiword property as `userId`, and rejects `user_id` on the response.
- Direct Axios calls in AI UI and direct fetch calls in AI chat components are included in the source scan. User-configurable chat can target a caller-supplied URL and may be an external provider boundary; the MCP JSON-RPC and Stripe payloads remain protocol-owned.
- Stripe and OpenAI provider fixtures must retain provider-required keys. The internal Chatkit session DTOs are now camelCase and their OpenAI mapping is isolated in `SimpleOpenAiClient`.
- The graph snapshot dates to 2026-10-28; file searches cross-checked live source where graph ownership was incomplete.

## Transition progress

- Shared Axios config now preserves camelCase data and keeps only common defaults plus query serialization (`configureAxios`).
- Converted all current `addConverters` callers and removed both key-case converter packages.
- Production and integration-test Jackson configurations both use `LOWER_CAMEL_CASE`; no `SNAKE_CASE` strategy remains in current backend source/config.
- Updated identity snake_case response assertions. Chatkit internal DTOs are camelCase; provider keys in OpenAI/Stripe remain at their external boundaries.
- Current verification: backend `compileJava test integrationTest` passes across all Gradle modules. Frontend Vitest (10 files, 19 tests), typecheck, targeted lint for changed contract files, and production build pass. The first build attempt exposed a missing local Tailwind package file; a frozen-lockfile reinstall restored it without changing versions. Full frontend lint still reports 24 existing errors and 23 warnings in unrelated AI, identity, payment, transaction, and app-shell files. Module `wallet` compiles and has no HTTP contract surface.
- Startup confidence: integration tests boot Spring contexts with test configuration and databases. This does not guarantee a developer or production startup with that environment's secrets, database, provider credentials, or network services.
