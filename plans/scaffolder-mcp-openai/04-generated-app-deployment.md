# Phase 04: Generated Application Deployment

Status: blocked

## Goal

Add an explicit, bounded way to deploy a generated OpenKnit variation after a deployment target, account ownership, and public-service cost model are selected.

## Scope

- A separate deployment adapter and MCP tool; deployment must not be hidden inside `generate_project`.
- Target-specific credentials/configuration held by the service, never supplied as arbitrary secrets in tool arguments or generated files.
- Asynchronous job lifecycle, idempotency, status, cancellation where supported, logs/errors, and cleanup.
- The existing Coolify configuration is evidence for deploying the scaffolder service only; it is not a generated-application provider contract.

## Dependencies

- User/product decision selecting deployment provider, ownership model, region/domain, secrets, confirmation, quotas, cost limits, and cleanup policy.
- Phases 1, 2, and 3 complete: validated project spec, artifact IDs, accurate setup content, and local bootstrap contract.
- Hosting/service operator confirms the no-auth endpoint can safely control the selected deployment capacity.

## Tasks

[!] P04-T01. Record the provider and ownership policy in `DECISIONS.md` before coding. If no provider is selected, keep the deliverable at artifact generation plus verified local Docker Compose deployment instructions. Blocked pending provider/ownership/cost/cleanup decision.
[!] P04-T02. Define `deploy_project` as a separate explicit side-effecting tool accepting a generated artifact ID and allowlisted deployment profile, never an arbitrary host/repository/shell command. Blocked by P04-T01.
[!] P04-T03. Decide whether anonymous public callers deploy into one OpenKnit-owned sandbox or whether deployment is postponed until the consuming harness can obtain user-scoped credentials/approval. No credentials are available in an unauthenticated call by default. Blocked by P04-T01.
[!] P04-T04. Implement provider adapter, environment/secret handling, idempotency key, job ID, status/cancel, sanitized logs, timeout, retry boundaries, artifact-to-job linkage, and automatic teardown/retention. Blocked by P04-T01 through P04-T03.
[!] P04-T05. Apply hard resource quotas, concurrency limits, rate limits, spend ceilings, abuse monitoring, and an operator kill switch. Define how noisy-neighbor and abandoned deployments are cleaned up. Blocked by P04-T01 through P04-T04.
[!] P04-T06. Update tool annotation/descriptions and instructions to mark deployment as an external side effect, explain its target, and state any required user approval supported by the host. Do not treat host-side confirmation as server authorization. Blocked by P04-T01 through P04-T05.
[!] P04-T07. Add provider sandbox integration checks for successful deployment, failure, retry/idempotency, cancellation, cleanup, and attempts to use an unapproved target. Blocked by P04-T01 through P04-T06.

## Done

- A caller can explicitly deploy only a previously generated artifact through the selected supported target.
- Every deployment has a traceable job and lifecycle; retries cannot create duplicate uncontrolled resources.
- Credentials never appear in tool inputs, user-visible logs, artifacts, or generated project files.
- Anonymous usage is bounded by the accepted ownership/cost policy; cleanup and operator disablement are verified.
- The user-facing/MCP guide clearly distinguishes compose/build, scaffolder service deployment, and generated-app deployment.

## Next

Proceed to Phase 5 release verification after the deployment decision and gateway pass.

## Open Questions

- Which target/provider should be supported first?
- Who owns and can access the resulting application and its data?
- Must deployment be available to anonymous MCP callers, or only to local/self-hosted installations with operator-controlled configuration?
- What are per-caller limits when the protocol intentionally has no caller identity?

## Changed Files

Target-specific adapter/config files under `scaffolder/src/`, MCP tool and job models, provider setup/deployment documentation, secret templates, integration tests, and possibly hosting manifests. Exact paths depend on the selected provider.

## Verification

### Task checks

- Provider sandbox tests for idempotency, target allowlisting, secret redaction, status/cancel, quotas, and teardown.
- No production credentials or public cloud resources in tests.

### Phase gateway

- Run all generation/MCP checks plus provider integration tests in an isolated sandbox. Perform an operator-reviewed staging deployment and teardown before enabling the tool publicly.

## Rollback Notes

Keep deployment registration independently disableable. On provider failure, turn off the tool and retain generation/retrieval; cancel/clean any jobs created by the failing release. Do not roll back by deleting user data without following the selected retention policy.
