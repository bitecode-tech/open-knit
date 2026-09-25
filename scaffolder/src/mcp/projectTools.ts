import type {CallToolResult} from "@modelcontextprotocol/sdk/types.js";
import type {ProjectOptionCatalog} from "@/projectSpec/projectOptions";
import type {ProjectSpec, ProjectSpecValidationResult} from "@/projectSpec/projectSpec";
import {
    CANONICAL_INSTRUCTIONS,
    CANONICAL_INSTRUCTIONS_DOCUMENT,
    INSTRUCTIONS_METADATA,
    ONBOARDING_RESOURCE_URI,
    getMcpServerInstructions
} from "@/guidance/instructions";
import {
    ArtifactLimitError,
    ArtifactStore,
    createArtifactId,
    createIdempotencyKeyDigest,
    type StoredArtifact
} from "./artifactStore";
import {McpAbuseLimiter} from "./abuseLimiter";

interface McpProtocolServer {
    setRequestHandler(schema: unknown, handler: (request: unknown) => Promise<unknown>): void;
    connect(transport: unknown): Promise<void>;
    close(): Promise<void>;
}

interface McpServerConstructor {
    new(
        serverInfo: {name: string; version: string},
        options: {capabilities: {tools: Record<string, never>; resources: Record<string, never>}; instructions: string}
    ): unknown;
}

interface McpRequestSchemas {
    ListToolsRequestSchema: unknown;
    CallToolRequestSchema: unknown;
    ListResourcesRequestSchema: unknown;
    ReadResourceRequestSchema: unknown;
}

const {Server: McpServerRuntime} = require("@modelcontextprotocol/sdk/server/index.js") as {
    Server: McpServerConstructor;
};
const {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema
} = require("@modelcontextprotocol/sdk/types.js") as McpRequestSchemas;

export interface ProjectGenerationService {
    getProjectOptionCatalog(): ProjectOptionCatalog;
    validateProjectSpec(projectSpec: unknown): ProjectSpecValidationResult;
    generateProject(
        projectSpec: unknown,
        options: {cacheMode: "rebuild" | "reuse"; outputIdentifier: string}
    ): Promise<string>;
}

export interface ProjectToolDependencies {
    projectService: ProjectGenerationService;
    artifactStore: ArtifactStore;
    abuseLimiter: McpAbuseLimiter;
    publicOrigin: string | null;
    generationTimeoutMs: number;
    getClientIp: () => string;
}

export function createProjectMcpServer(dependencies: ProjectToolDependencies): McpProtocolServer {
    const server = new McpServerRuntime(
        {
            name: "OpenKnit project scaffolder",
            version: getScaffolderVersion()
        },
        {
            capabilities: {tools: {}, resources: {}},
            instructions: getMcpServerInstructions()
        }
    ) as McpProtocolServer;

    server.setRequestHandler(ListToolsRequestSchema, async () => ({tools: projectToolDefinitions}));
    server.setRequestHandler(CallToolRequestSchema, async (request) => handleToolCall(request, dependencies));
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [{
            uri: ONBOARDING_RESOURCE_URI,
            name: "OpenKnit onboarding and development guide",
            title: "OpenKnit onboarding and development guide",
            description: "Versioned canonical instructions for safe project generation, local setup, and generic development task intake.",
            mimeType: "text/markdown",
            _meta: INSTRUCTIONS_METADATA
        }]
    }));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uri = isRecord(request) && isRecord(request.params) ? request.params.uri : undefined;
        if (uri !== ONBOARDING_RESOURCE_URI) {
            throw new Error("The requested OpenKnit resource is not available.");
        }
        return {
            contents: [{
                uri: ONBOARDING_RESOURCE_URI,
                mimeType: "text/markdown",
                text: CANONICAL_INSTRUCTIONS,
                _meta: INSTRUCTIONS_METADATA
            }]
        };
    });

    return server;
}

const projectSpecToolSchema = {
    type: "object",
    properties: {
        schemaVersion: {type: "integer", const: 1},
        projectName: {type: "string", minLength: 2, maxLength: 48},
        modules: {type: "array", items: {type: "string"}, minItems: 1},
        targetPlatform: {type: "string", enum: ["windows", "linux", "macos"]},
        demoInsertsEnabled: {type: "boolean"},
        templateId: {type: "string"}
    },
    required: ["schemaVersion", "projectName", "modules", "targetPlatform"],
    additionalProperties: false,
    description: "A schemaVersion 1 projectSpec. Unknown fields are rejected with field-addressable validation errors."
};

const projectToolDefinitions = [
    {
        name: "list_project_options",
        title: "List OpenKnit project options",
        description:
            "List generator-supported module and bundle IDs, platform templates, defaults, and constraints. Ready-system options are not generated in this version.",
        inputSchema: {type: "object", properties: {}, additionalProperties: false}
    },
    {
        name: "validate_project_spec",
        title: "Validate an OpenKnit project spec",
        description:
            "Normalize and validate a closed schemaVersion 1 projectSpec without writing files. Errors identify the field that needs correction.",
        inputSchema: {
            type: "object",
            properties: {projectSpec: projectSpecToolSchema},
            required: ["projectSpec"],
            additionalProperties: false
        }
    },
    {
        name: "generate_project",
        title: "Generate an OpenKnit project ZIP",
        description:
            "Generate a bounded ZIP from a validated projectSpec and return a fixed-origin download URL, checksum, expiry, canonical onboarding guide, and manifest schema version. Review the setup guidance before offering download or extraction. The remote server does not inspect, install, start, or deploy files on the caller's host. Artifacts expire after the published retention window.",
        inputSchema: {
            type: "object",
            properties: {
                projectSpec: projectSpecToolSchema,
                idempotencyKey: {type: "string", minLength: 1, maxLength: 128}
            },
            required: ["projectSpec"],
            additionalProperties: false
        }
    }
] as const;

async function handleToolCall(request: unknown, dependencies: ProjectToolDependencies): Promise<CallToolResult> {
    const toolCall = parseToolCall(request);
    if (!toolCall) {
        return createErrorResult("INVALID_TOOL_CALL", "Tool call arguments must be an object.");
    }

    if (toolCall.name === "list_project_options") {
        const unsupportedFields = Object.keys(toolCall.arguments);
        if (unsupportedFields.length > 0) {
            return createInvalidFieldResult(unsupportedFields, "Tool arguments are not supported.");
        }
        const catalog = dependencies.projectService.getProjectOptionCatalog();
        return createToolResult(
            catalog,
            `Found ${catalog.modules.length} supported modules and ${catalog.templates.length} bundle templates. targetPlatform must be selected explicitly.`
        );
    }

    if (toolCall.name === "validate_project_spec") {
        const unsupportedFields = Object.keys(toolCall.arguments).filter((field) => field !== "projectSpec");
        if (unsupportedFields.length > 0) {
            return createInvalidFieldResult(unsupportedFields, "Unknown tool argument.");
        }
        const validation = dependencies.projectService.validateProjectSpec(toolCall.arguments.projectSpec);
        return createToolResult(
            validation,
            validation.valid
                ? `Project spec is valid for ${validation.normalizedProjectSpec?.targetPlatform}.`
                : formatValidationErrors(validation)
        );
    }

    if (toolCall.name === "generate_project") {
        const unsupportedFields = Object.keys(toolCall.arguments).filter((field) => {
            return field !== "projectSpec" && field !== "idempotencyKey";
        });
        if (unsupportedFields.length > 0) {
            return createInvalidFieldResult(unsupportedFields, "Unknown tool argument.");
        }
        const idempotencyKey = toolCall.arguments.idempotencyKey;
        if (idempotencyKey !== undefined && typeof idempotencyKey !== "string") {
            return createInvalidFieldResult(["idempotencyKey"], "idempotencyKey must be a string.");
        }
        return generateProjectResult(toolCall.arguments.projectSpec, idempotencyKey, dependencies);
    }

    return createErrorResult("UNKNOWN_TOOL", "The requested tool is not supported.");
}

function parseToolCall(request: unknown): {name: string; arguments: Record<string, unknown>} | null {
    if (!isRecord(request) || !isRecord(request.params) || typeof request.params.name !== "string") {
        return null;
    }
    const argumentsValue = request.params.arguments;
    if (argumentsValue === undefined) {
        return {name: request.params.name, arguments: {}};
    }
    if (!isRecord(argumentsValue)) {
        return null;
    }
    return {name: request.params.name, arguments: argumentsValue};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createInvalidFieldResult(fields: readonly string[], message: string): CallToolResult {
    return createToolResult(
        {
            valid: false,
            errors: fields.map((field) => ({field, code: "unknown_field", message: `${message} Field: ${field}.`}))
        },
        `${message} ${fields.join(", ")}.`
    );
}

async function generateProjectResult(
    projectSpecInput: unknown,
    idempotencyKey: string | undefined,
    dependencies: ProjectToolDependencies
): Promise<CallToolResult> {
    const validation = dependencies.projectService.validateProjectSpec(projectSpecInput);
    if (!validation.valid || validation.normalizedProjectSpec === null) {
        return createToolResult(validation, formatValidationErrors(validation));
    }
    if (dependencies.publicOrigin === null) {
        return createErrorResult(
            "PUBLIC_ORIGIN_NOT_CONFIGURED",
            "Project generation downloads are not configured for this host."
        );
    }
    if (idempotencyKey !== undefined && !/^[A-Za-z0-9._~-]{1,128}$/.test(idempotencyKey)) {
        return createInvalidFieldResult(["idempotencyKey"], "idempotencyKey has an invalid format.");
    }

    const normalizedProjectSpec = validation.normalizedProjectSpec;
    const clientIp = dependencies.getClientIp();
    const idempotencyKeyDigest = idempotencyKey === undefined
        ? undefined
        : createIdempotencyKeyDigest(clientIp, idempotencyKey);
    if (idempotencyKeyDigest) {
        const existingArtifact = await dependencies.artifactStore.findByIdempotencyKeyDigest(idempotencyKeyDigest);
        if (existingArtifact) {
            if (JSON.stringify(existingArtifact.projectSpec) !== JSON.stringify(normalizedProjectSpec)) {
                return createErrorResult(
                    "IDEMPOTENCY_KEY_CONFLICT",
                    "This idempotencyKey was already used for a different normalized project spec."
                );
            }
            return createGeneratedArtifactResult(existingArtifact, dependencies.publicOrigin, true);
        }
    }

    const releaseGenerationSlot = dependencies.abuseLimiter.acquireGenerationSlot(clientIp);
    if (!releaseGenerationSlot) {
        return createErrorResult(
            "GENERATION_CONCURRENCY_LIMIT",
            "Another generation request is active for this client or the service is busy. Try again shortly."
        );
    }

    const artifactId = createArtifactId();
    let outputArchivePath: string | undefined;
    let timedOut = false;
    const generationPromise = dependencies.projectService.generateProject(
        normalizedProjectSpec,
        {cacheMode: "reuse", outputIdentifier: artifactId}
    );
    try {
        outputArchivePath = await waitForGeneration(generationPromise, dependencies.generationTimeoutMs);
        const artifact = await dependencies.artifactStore.storeGeneratedArchive(
            artifactId,
            outputArchivePath,
            normalizedProjectSpec,
            idempotencyKeyDigest
        );
        return createGeneratedArtifactResult(artifact, dependencies.publicOrigin, false);
    } catch (error) {
        if (error instanceof GenerationTimeoutError) {
            timedOut = true;
            void generationPromise.then(
                async (generatedPath) => removeGeneratedArchive(generatedPath),
                () => undefined
            ).finally(releaseGenerationSlot);
            return createErrorResult(
                "GENERATION_TIMEOUT",
                "Project generation exceeded the configured time limit. Try a smaller module selection."
            );
        }
        if (error instanceof ArtifactLimitError) {
            return createErrorResult("ARTIFACT_LIMIT_EXCEEDED", error.message);
        }
        if (error instanceof ProjectGenerationInputError) {
            return createToolResult(error.validation, formatValidationErrors(error.validation));
        }
        return createErrorResult(
            "GENERATION_FAILED",
            "Project generation failed. Check the project spec and retry later."
        );
    } finally {
        if (outputArchivePath) {
            await removeGeneratedArchive(outputArchivePath);
        }
        if (!timedOut) {
            releaseGenerationSlot();
        }
    }
}

function createToolResult(data: object, text: string): CallToolResult {
    return {
        content: [{type: "text", text}],
        structuredContent: data as Record<string, unknown>
    };
}

function createErrorResult(code: string, message: string): CallToolResult {
    return {
        isError: true,
        content: [{type: "text", text: message}],
        structuredContent: {code, message}
    };
}

function createGeneratedArtifactResult(
    artifact: StoredArtifact,
    publicOrigin: string,
    reused: boolean
): CallToolResult {
    const downloadUrl = new URL(`/api/artifacts/${artifact.id}`, `${publicOrigin}/`).toString();
    const expiresAt = new Date(artifact.expiresAt).toISOString();
    const rootStartCommand = artifact.projectSpec.targetPlatform === "linux"
        ? "docker compose up"
        : "docker compose watch";
    const result = {
        status: "generated",
        generationId: artifact.id,
        artifactId: artifact.id,
        projectSpec: artifact.projectSpec,
        checksumSha256: artifact.checksumSha256,
        byteSize: artifact.byteSize,
        expiresAt,
        downloadUrl,
        reused,
        instructions: CANONICAL_INSTRUCTIONS_DOCUMENT,
        projectManifestSchemaVersion: 1,
        setup: {
            targetPlatform: artifact.projectSpec.targetPlatform,
            startCommand: rootStartCommand,
            selectedModules: [...artifact.projectSpec.modules]
        },
        onboardingSummary: [
            "Review canonical onboarding guide version " + INSTRUCTIONS_METADATA.version +
                " and manifest schema version 1 before download or extraction.",
            "Selected platform: " + artifact.projectSpec.targetPlatform + "; root start command: " + rootStartCommand + ".",
            "Download before " + expiresAt + " and verify the published SHA-256 checksum.",
            "Extract into a new empty directory and inspect open-knit-project.json before running scripts.",
            "Remote ZIP generation does not inspect, install, start, or deploy anything on your host."
        ]
    };
    return createToolResult(
        result,
        `Project ZIP is ready at ${downloadUrl}. The link expires at ${expiresAt}. Remote generation did not inspect, install, start, or deploy anything on your host.`
    );
}

function formatValidationErrors(validation: ProjectSpecValidationResult): string {
    if (validation.errors.length === 0) {
        return "Project spec is invalid.";
    }
    return `Project spec is invalid: ${validation.errors
        .map((issue) => `${issue.field}: ${issue.message}`)
        .join(" ")}`;
}

class GenerationTimeoutError extends Error {
    constructor() {
        super("Project generation timed out.");
        this.name = "GenerationTimeoutError";
    }
}

function waitForGeneration<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new GenerationTimeoutError()), timeoutMs);
        timeout.unref?.();
        promise.then(
            (value) => {
                clearTimeout(timeout);
                resolve(value);
            },
            (error: unknown) => {
                clearTimeout(timeout);
                reject(error);
            }
        );
    });
}

async function removeGeneratedArchive(filePath: string): Promise<void> {
    const fs = await import("fs/promises");
    await fs.rm(filePath, {force: true}).catch(() => undefined);
}

function getScaffolderVersion(): string {
    try {
        const packageFile = require("../../package.json") as {version?: unknown};
        return typeof packageFile.version === "string" ? packageFile.version : "0.0.0";
    } catch {
        return "0.0.0";
    }
}

export class ProjectGenerationInputError extends Error {
    readonly validation: ProjectSpecValidationResult;

    constructor(validation: ProjectSpecValidationResult) {
        super("Project generation input was invalid.");
        this.name = "ProjectGenerationInputError";
        this.validation = validation;
    }
}
