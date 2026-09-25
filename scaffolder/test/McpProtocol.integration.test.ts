import assert from "node:assert/strict";
import {createServer, type Server} from "node:http";
import type {AddressInfo} from "node:net";
import {mkdtemp, mkdir, rm, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import express from "express";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {test} from "node:test";
import {ArtifactStore} from "../src/mcp/artifactStore";
import {McpAbuseLimiter} from "../src/mcp/abuseLimiter";
import {createMcpRouter, type McpRouterOptions} from "../src/mcp/router";
import type {ProjectGenerationService} from "../src/mcp/projectTools";
import {CANONICAL_INSTRUCTIONS} from "../src/guidance/instructions";
import {getProjectOptionCatalog} from "../src/projectSpec/projectOptions";
import {validateProjectSpec} from "../src/projectSpec/projectSpec";

const supportedModuleIds = ["identity", "payment", "transaction"];
const validProjectSpec = {
    schemaVersion: 1,
    projectName: "protocol-check",
    modules: ["identity"],
    targetPlatform: "linux",
    demoInsertsEnabled: true
} as const;

interface TestRigOptions {
    archiveBytes?: Buffer;
    beforeGeneration?: () => Promise<void>;
    maxArtifactBytes?: number;
    maxRequestsPerWindow?: number;
    maxTotalBytes?: number;
    generationTimeoutMs?: number;
    ttlMs?: number;
}

interface McpTestRig {
    artifactStore: ArtifactStore;
    currentTime: number;
    generationCount: number;
    origin: string;
    server: Server;
    temporaryDirectory: string;
    advanceTime(milliseconds: number): void;
    close(): Promise<void>;
}

interface ToolError {
    code: string;
    message: string;
}

interface ValidationResult {
    errors: Array<{field: string; code: string; message: string}>;
    normalizedProjectSpec: {
        projectName: string;
        targetPlatform: string;
    } | null;
    valid: boolean;
}

interface ProjectOptionCatalogResult {
    modules: Array<{id: string; defaultSelected: boolean; required: boolean}>;
}

interface GeneratedArtifactResult {
    artifactId: string;
    byteSize: number;
    checksumSha256: string;
    downloadUrl: string;
    expiresAt: string;
    reused: boolean;
    instructions: {
        content: string;
        version: string;
        sha256: string;
        resourceUri: string;
    };
    projectManifestSchemaVersion: number;
    setup: {
        targetPlatform: string;
        startCommand: string;
        selectedModules: string[];
    };
}

async function createMcpTestRig(options: TestRigOptions = {}): Promise<McpTestRig> {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "open-knit-mcp-test-"));
    const generatedArchivesDirectory = path.join(temporaryDirectory, "generated");
    await mkdir(generatedArchivesDirectory, {recursive: true});

    let currentTime = Date.now();
    let generationCount = 0;
    const archiveBytes = options.archiveBytes ?? Buffer.from("small bounded test archive");
    const artifactStore = new ArtifactStore({
        directory: path.join(temporaryDirectory, "artifacts"),
        ttlMs: options.ttlMs ?? 60_000,
        maxArtifactBytes: options.maxArtifactBytes ?? 4_096,
        maxTotalBytes: options.maxTotalBytes ?? 8_192,
        now: () => currentTime
    });
    await artifactStore.initialize();

    const projectService: ProjectGenerationService = {
        getProjectOptionCatalog: () => getProjectOptionCatalog(supportedModuleIds),
        validateProjectSpec: (projectSpec) => validateProjectSpec(projectSpec, {supportedModuleIds}),
        generateProject: async (_projectSpec, {outputIdentifier}) => {
            generationCount += 1;
            await options.beforeGeneration?.();
            const generatedArchivePath = path.join(generatedArchivesDirectory, `${outputIdentifier}.zip`);
            await writeFile(generatedArchivePath, archiveBytes);
            return generatedArchivePath;
        }
    };

    const reservation = createServer();
    reservation.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
        reservation.once("listening", resolve);
        reservation.once("error", reject);
    });
    const address = reservation.address() as AddressInfo;
    await new Promise<void>((resolve, reject) => {
        reservation.close((error) => error ? reject(error) : resolve());
    });

    const origin = `http://127.0.0.1:${address.port}`;
    const limiter = new McpAbuseLimiter({maxRequestsPerWindow: options.maxRequestsPerWindow});
    const routerOptions: McpRouterOptions = {
        projectService,
        artifactStore,
        abuseLimiter: limiter,
        publicOrigin: origin,
        allowedOrigins: [],
        generationTimeoutMs: options.generationTimeoutMs ?? 30_000,
        artifactStoreReady: Promise.resolve()
    };
    const app = express();
    app.use(createMcpRouter(routerOptions));
    const server = app.listen(address.port, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    return {
        artifactStore,
        get currentTime() {
            return currentTime;
        },
        get generationCount() {
            return generationCount;
        },
        origin,
        server,
        temporaryDirectory,
        advanceTime: (milliseconds) => {
            currentTime += milliseconds;
        },
        close: async () => {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
            await rm(temporaryDirectory, {recursive: true, force: true});
        }
    };
}

function readStructuredContent<T>(result: Record<string, unknown>): T {
    const structuredContent: unknown = result.structuredContent;
    assert.equal(typeof structuredContent, "object");
    assert.notEqual(structuredContent, null);
    return structuredContent as T;
}

function isTextContent(value: unknown): value is {type: "text"; text: string} {
    return typeof value === "object" && value !== null &&
        "type" in value && value.type === "text" &&
        "text" in value && typeof value.text === "string";
}

function readToolText(result: Record<string, unknown>): string {
    assert.ok(Array.isArray(result.content));
    const textContent = (result.content as unknown[]).find(isTextContent);
    assert.ok(textContent);
    return textContent.text;
}

function createMcpClient(): Client {
    return new Client({name: "responses-api-compatible-client", version: "1.0.0"});
}

test("stateless Streamable HTTP supports initialize, tools, validation, idempotent generation and expiring retrieval", async () => {
    const rig = await createMcpTestRig({ttlMs: 1_000});
    const client = createMcpClient();
    const transport = new StreamableHTTPClientTransport(new URL(`${rig.origin}/mcp`));

    try {
        await client.connect(transport);
        assert.equal(transport.protocolVersion, "2025-11-25");
        const serverInstructions = client.getInstructions() ?? "";
        assert.match(serverInstructions.slice(0, 512), /list_project_options/i);
        assert.match(serverInstructions.slice(0, 512), /validate_project_spec/i);
        assert.match(serverInstructions.slice(0, 512), /Verify ZIP SHA-256 and expiry/i);
        assert.match(serverInstructions.slice(0, 512), /does not inspect your machine/i);
        assert.equal(transport.sessionId, undefined);

        const listedResources = await client.listResources();
        assert.deepEqual(listedResources.resources.map((resource) => resource.uri), [
            "openknit://scaffolder/onboarding"
        ]);
        const onboardingResource = await client.readResource({uri: "openknit://scaffolder/onboarding"});
        assert.equal(onboardingResource.contents[0]?.text, CANONICAL_INSTRUCTIONS);
        assert.equal(onboardingResource.contents[0]?._meta?.version, "1.0.0");

        const instructionsResponse = await fetch(rig.origin + "/api/instructions");
        assert.equal(instructionsResponse.status, 200);
        assert.match(instructionsResponse.headers.get("content-type") ?? "", /application\/json/);
        const httpInstructions = await instructionsResponse.json() as {
            content: string;
            version: string;
            sha256: string;
            lastModified: string;
        };
        assert.ok((instructionsResponse.headers.get("etag") ?? "").includes(httpInstructions.sha256));
        assert.equal(httpInstructions.content, onboardingResource.contents[0]?.text);
        assert.equal(httpInstructions.version, onboardingResource.contents[0]?._meta?.version);
        assert.equal(httpInstructions.sha256, onboardingResource.contents[0]?._meta?.sha256);
        assert.ok(httpInstructions.lastModified);

        const tools = await client.listTools();
        assert.deepEqual(
            tools.tools.map((tool) => tool.name).sort(),
            ["generate_project", "list_project_options", "validate_project_spec"]
        );
        assert.equal(tools.tools.find((tool) => tool.name === "generate_project")?.inputSchema.additionalProperties, false);
        const validateProjectSpecInputSchema = tools.tools.find((tool) => tool.name === "validate_project_spec")?.inputSchema as unknown as {
            properties?: {projectSpec?: {additionalProperties?: boolean}};
        } | undefined;
        const generateProjectInputSchema = tools.tools.find((tool) => tool.name === "generate_project")?.inputSchema as unknown as {
            properties?: {projectSpec?: {additionalProperties?: boolean}};
        } | undefined;
        assert.equal(validateProjectSpecInputSchema?.properties?.projectSpec?.additionalProperties, false);
        assert.equal(generateProjectInputSchema?.properties?.projectSpec?.additionalProperties, false);

        const optionsResult = await client.callTool({name: "list_project_options", arguments: {}});
        const options = readStructuredContent<ProjectOptionCatalogResult>(optionsResult);
        const identityOption = options.modules.find((moduleOption) => moduleOption.id === "identity");
        assert.equal(identityOption?.required, true);
        assert.equal(identityOption?.defaultSelected, true);

        const validResult = await client.callTool({
            name: "validate_project_spec",
            arguments: {projectSpec: validProjectSpec}
        });
        const validation = readStructuredContent<ValidationResult>(validResult);
        assert.equal(validation.valid, true);
        assert.equal(validation.normalizedProjectSpec?.targetPlatform, "linux");

        const missingIdentityResult = await client.callTool({
            name: "validate_project_spec",
            arguments: {projectSpec: {...validProjectSpec, modules: ["payment"]}}
        });
        const missingIdentityValidation = readStructuredContent<ValidationResult>(missingIdentityResult);
        assert.equal(missingIdentityValidation.valid, false);
        assert.deepEqual(missingIdentityValidation.errors.map((issue) => ({field: issue.field, code: issue.code})), [
            {field: "modules", code: "missing_required_module"}
        ]);

        const invalidResult = await client.callTool({
            name: "validate_project_spec",
            arguments: {
                projectSpec: {...validProjectSpec, projectName: "bad/name", aiEnabled: true}
            }
        });
        const invalidValidation = readStructuredContent<ValidationResult>(invalidResult);
        assert.equal(invalidValidation.valid, false);
        assert.deepEqual(
            invalidValidation.errors.map((issue) => issue.field).sort(),
            ["aiEnabled", "projectName"]
        );

        const generated = await client.callTool({
            name: "generate_project",
            arguments: {projectSpec: validProjectSpec, idempotencyKey: "protocol-check-key"}
        });
        const artifact = readStructuredContent<GeneratedArtifactResult>(generated);
        assert.equal(generated.isError, undefined);
        assert.equal(artifact.byteSize, Buffer.byteLength("small bounded test archive"));
        assert.match(artifact.checksumSha256, /^[a-f0-9]{64}$/);
        assert.equal(new URL(artifact.downloadUrl).origin, rig.origin);
        const generatedText = readToolText(generated);
        assert.match(generatedText, /expires at/);
        assert.match(generatedText, /did not inspect, install, start, or deploy/i);
        assert.equal("archiveBytes" in artifact, false);
        assert.equal(artifact.instructions.content, CANONICAL_INSTRUCTIONS);
        assert.equal(artifact.instructions.version, httpInstructions.version);
        assert.equal(artifact.instructions.sha256, httpInstructions.sha256);
        assert.equal(artifact.projectManifestSchemaVersion, 1);
        assert.deepEqual(artifact.setup, {
            targetPlatform: "linux",
            startCommand: "docker compose up",
            selectedModules: ["identity"]
        });

        const reused = await client.callTool({
            name: "generate_project",
            arguments: {projectSpec: validProjectSpec, idempotencyKey: "protocol-check-key"}
        });
        const reusedArtifact = readStructuredContent<GeneratedArtifactResult>(reused);
        assert.equal(reusedArtifact.artifactId, artifact.artifactId);
        assert.equal(reusedArtifact.reused, true);
        assert.equal(rig.generationCount, 1);

        const conflicting = await client.callTool({
            name: "generate_project",
            arguments: {
                projectSpec: {...validProjectSpec, projectName: "other-project"},
                idempotencyKey: "protocol-check-key"
            }
        });
        assert.equal(conflicting.isError, true);
        assert.equal(readStructuredContent<ToolError>(conflicting).code, "IDEMPOTENCY_KEY_CONFLICT");

        const download = await fetch(artifact.downloadUrl);
        assert.equal(download.status, 200);
        assert.equal(download.headers.get("content-type"), "application/zip");
        assert.match(download.headers.get("cache-control") ?? "", /no-store/);
        assert.deepEqual(Buffer.from(await download.arrayBuffer()), Buffer.from("small bounded test archive"));

        rig.advanceTime(1_000);
        const expiredDownload = await fetch(artifact.downloadUrl);
        assert.equal(expiredDownload.status, 404);
        assert.equal(await rig.artifactStore.getAvailableArtifact(artifact.artifactId), null);
    } finally {
        await client.close().catch(() => undefined);
        await rig.close();
    }
});

test("MCP validates Origin, rejects malformed and oversized requests, and enforces request limits", async () => {
    const rig = await createMcpTestRig({maxRequestsPerWindow: 1});
    const post = (body: string, headers: Record<string, string> = {}) => fetch(`${rig.origin}/mcp`, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...headers},
        body
    });

    try {
        const preflight = await fetch(`${rig.origin}/mcp`, {
            method: "OPTIONS",
            headers: {Origin: rig.origin}
        });
        assert.equal(preflight.status, 204);
        assert.equal(preflight.headers.get("access-control-allow-origin"), rig.origin);

        const rejectedOrigin = await fetch(`${rig.origin}/mcp`, {
            method: "OPTIONS",
            headers: {Origin: "https://attacker.invalid"}
        });
        assert.equal(rejectedOrigin.status, 403);

        const malformed = await post("{");
        assert.equal(malformed.status, 400);
        const malformedPayload = await malformed.json() as {error: {code: number}};
        assert.equal(malformedPayload.error.code, -32700);

        const oversized = await post(JSON.stringify({data: "x".repeat(17 * 1024)}));
        assert.equal(oversized.status, 413);
        const oversizedPayload = await oversized.json() as {error: {code: number}};
        assert.equal(oversizedPayload.error.code, -32000);

        const initializeRequest = JSON.stringify({
            jsonrpc: "2.0",
            id: "rate-limit-check",
            method: "initialize",
            params: {
                protocolVersion: "2025-03-26",
                capabilities: {},
                clientInfo: {name: "anonymous-protocol-client", version: "1.0.0"}
            }
        });
        const firstRequest = await post(initializeRequest, {
            Accept: "application/json, text/event-stream"
        });
        assert.notEqual(firstRequest.status, 429);

        const limitedRequest = await post(initializeRequest, {
            Accept: "application/json, text/event-stream"
        });
        assert.equal(limitedRequest.status, 429);
        assert.ok(Number(limitedRequest.headers.get("retry-after")) >= 1);
    } finally {
        await rig.close();
    }
});

test("MCP generation enforces archive size limits and active generation concurrency", async () => {
    const archiveBytes = Buffer.alloc(128, 0x5a);
    let releaseGeneration: (() => void) | undefined;
    let generationStarted: (() => void) | undefined;
    const generationGate = new Promise<void>((resolve) => {
        releaseGeneration = resolve;
    });
    const generationStartedPromise = new Promise<void>((resolve) => {
        generationStarted = resolve;
    });
    const rig = await createMcpTestRig({
        archiveBytes,
        maxArtifactBytes: 64,
        maxTotalBytes: 128,
        beforeGeneration: async () => {
            generationStarted?.();
            await generationGate;
        }
    });
    const client = createMcpClient();
    const transport = new StreamableHTTPClientTransport(new URL(`${rig.origin}/mcp`));

    try {
        await client.connect(transport);
        const firstGeneration = client.callTool({
            name: "generate_project",
            arguments: {projectSpec: validProjectSpec, idempotencyKey: "first-generation"}
        });
        await generationStartedPromise;

        const blockedGeneration = await client.callTool({
            name: "generate_project",
            arguments: {projectSpec: {...validProjectSpec, projectName: "second-project"}}
        });
        assert.equal(blockedGeneration.isError, true);
        assert.equal(
            readStructuredContent<ToolError>(blockedGeneration).code,
            "GENERATION_CONCURRENCY_LIMIT"
        );

        releaseGeneration?.();
        const oversizedArchive = await firstGeneration;
        assert.equal(oversizedArchive.isError, true);
        assert.equal(readStructuredContent<ToolError>(oversizedArchive).code, "ARTIFACT_LIMIT_EXCEEDED");
        assert.equal(rig.generationCount, 1);
    } finally {
        releaseGeneration?.();
        await client.close().catch(() => undefined);
        await rig.close();
    }
});

test("MCP generation enforces the total stored-archive budget", async () => {
    const rig = await createMcpTestRig({
        archiveBytes: Buffer.alloc(48, 0x5a),
        maxArtifactBytes: 64,
        maxTotalBytes: 64
    });
    const client = createMcpClient();
    const transport = new StreamableHTTPClientTransport(new URL(`${rig.origin}/mcp`));

    try {
        await client.connect(transport);
        const firstGeneration = await client.callTool({
            name: "generate_project",
            arguments: {projectSpec: validProjectSpec, idempotencyKey: "total-budget-first"}
        });
        const firstArtifact = readStructuredContent<GeneratedArtifactResult>(firstGeneration);
        assert.equal(firstArtifact.byteSize, 48);

        const secondGeneration = await client.callTool({
            name: "generate_project",
            arguments: {
                projectSpec: {...validProjectSpec, projectName: "second-project"},
                idempotencyKey: "total-budget-second"
            }
        });
        assert.equal(secondGeneration.isError, true);
        assert.equal(readStructuredContent<ToolError>(secondGeneration).code, "ARTIFACT_LIMIT_EXCEEDED");
        assert.notEqual(await rig.artifactStore.getAvailableArtifact(firstArtifact.artifactId), null);
        assert.equal(rig.generationCount, 2);
    } finally {
        await client.close().catch(() => undefined);
        await rig.close();
    }
});

test("MCP generation timeout returns a sanitized error", async () => {
    let releaseGeneration: (() => void) | undefined;
    let generationStarted: (() => void) | undefined;
    const generationGate = new Promise<void>((resolve) => {
        releaseGeneration = resolve;
    });
    const generationStartedPromise = new Promise<void>((resolve) => {
        generationStarted = resolve;
    });
    const rig = await createMcpTestRig({
        generationTimeoutMs: 50,
        beforeGeneration: async () => {
            generationStarted?.();
            await generationGate;
        }
    });
    const client = createMcpClient();
    const transport = new StreamableHTTPClientTransport(new URL(`${rig.origin}/mcp`));

    try {
        await client.connect(transport);
        const generation = client.callTool({
            name: "generate_project",
            arguments: {projectSpec: validProjectSpec}
        });
        await generationStartedPromise;
        const timedOut = await generation;
        assert.equal(timedOut.isError, true);
        assert.equal(readStructuredContent<ToolError>(timedOut).code, "GENERATION_TIMEOUT");
        assert.doesNotMatch(readToolText(timedOut), /\/tmp|open-knit-mcp-test|generated/i);
    } finally {
        releaseGeneration?.();
        await client.close().catch(() => undefined);
        await rig.close();
    }
});
