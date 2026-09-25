import path from "path";
import {register} from "tsconfig-paths";
import express from "express";
import {loadEnvFile} from "./env/loadEnvFile";
import {installTimestampedConsole} from "./logging/installTimestampedConsole";
import {ArtifactStore} from "./mcp/artifactStore";
import {McpAbuseLimiter} from "./mcp/abuseLimiter";
import {createMcpRouter} from "./mcp/router";

installTimestampedConsole();

register({
    baseUrl: path.resolve(__dirname),
    paths: {
        "@/*": ["*"]
    }
});

loadEnvFile();

const scaffolderService = require("@/services/ScaffolderService").default;
const incrementDownloadCounters = require("./db/downloadCounterRepository").incrementDownloadCounters;
const createWishlistEntry = require("./db/wishlistRepository").createWishlistEntry;
const initializeDatabaseSchema = require("./db/bootstrap").initializeDatabaseSchema;
const getConfiguredDatabaseUrl = require("./db/client").getConfiguredDatabaseUrl;

export const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT ?? 7070);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const scaffoldRateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 3);
const scaffoldRateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 30_000);
const enableRateLimitDiagnostics = process.env.RATE_LIMIT_DIAGNOSTICS === "true";
const wishlistRateLimitMax = 3;
const wishlistRateLimitWindowMs = 30_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mcpPublicOrigin = resolveMcpPublicOrigin(process.env.MCP_PUBLIC_ORIGIN, process.env.NODE_ENV, port);
const mcpAllowedOrigins = (process.env.MCP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
const mcpGenerationTimeoutMs = readBoundedNumber(process.env.MCP_GENERATION_TIMEOUT_MS, 120_000, 10_000, 180_000);
const mcpAbuseLimiter = new McpAbuseLimiter();
const artifactStore = new ArtifactStore({
    directory: path.resolve(__dirname, "..", "output", "mcp-artifacts"),
    ttlMs: 60 * 60_000,
    maxArtifactBytes: 50 * 1024 * 1024,
    maxTotalBytes: 250 * 1024 * 1024
});
const artifactStoreReady = artifactStore.initialize();
void artifactStoreReady.catch(() => {
    console.error("[scaffolder] MCP artifact storage initialization failed.");
});

type RateLimitEntry = {
    timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function normalizeIpAddress(ipAddress: string): string {
    if (ipAddress.startsWith("::ffff:")) {
        return ipAddress.slice(7);
    }
    return ipAddress;
}

function getFirstHeaderIp(headerValue: string | string[] | undefined): string {
    if (Array.isArray(headerValue)) {
        return String(headerValue[0] ?? "").trim();
    }
    return String(headerValue ?? "").split(",")[0]?.trim() ?? "";
}

app.use(createMcpRouter({
    projectService: scaffolderService,
    artifactStore,
    abuseLimiter: mcpAbuseLimiter,
    publicOrigin: mcpPublicOrigin,
    allowedOrigins: mcpAllowedOrigins,
    generationTimeoutMs: mcpGenerationTimeoutMs,
    artifactStoreReady
}));

app.use(express.json({limit: "16kb"}));
app.use((req, res, next) => {
    if (req.path === "/mcp" || req.path.startsWith("/mcp/")) {
        next();
        return;
    }
    res.header("Access-Control-Allow-Origin", corsOrigin);
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});

function buildRateLimiter(maxRequests: number, windowMs: number, keyPrefix: string): express.RequestHandler {
    return (req, res, next) => {
        const forwardedForHeaderValue = req.headers["x-forwarded-for"];
        const cloudflareConnectingIpValue = req.headers["cf-connecting-ip"];
        const firstForwardedForIp = getFirstHeaderIp(forwardedForHeaderValue);
        const cloudflareConnectingIp = getFirstHeaderIp(cloudflareConnectingIpValue);
        const remoteSocketIp = req.socket.remoteAddress ?? "unknown";
        const resolvedRequestIp = req.ip ?? "unknown";
        const rateLimitClientIpRaw = cloudflareConnectingIp || firstForwardedForIp || resolvedRequestIp;
        const rateLimitClientIp = normalizeIpAddress(rateLimitClientIpRaw || "unknown");
        const key = `${keyPrefix}:${rateLimitClientIp}`;
        const now = Date.now();
        const entry = rateLimitStore.get(key) ?? {timestamps: []};
        entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= windowMs);

        if (entry.timestamps.length >= maxRequests) {
            if (enableRateLimitDiagnostics && keyPrefix === "scaffold-download") {
                console.warn(
                    `[scaffolder] rate-limit deny key=${key} req.ip=${resolvedRequestIp} limiter-ip=${rateLimitClientIp} cf-connecting-ip=${cloudflareConnectingIp || "-"} x-forwarded-for=${firstForwardedForIp || "-"} remote=${remoteSocketIp} count=${entry.timestamps.length} max=${maxRequests} windowMs=${windowMs}`
                );
            }
            res.status(429).json({error: "Too many requests"});
            return;
        }

        entry.timestamps.push(now);
        rateLimitStore.set(key, entry);
        if (enableRateLimitDiagnostics && keyPrefix === "scaffold-download") {
            console.log(
                `[scaffolder] rate-limit allow key=${key} req.ip=${resolvedRequestIp} limiter-ip=${rateLimitClientIp} cf-connecting-ip=${cloudflareConnectingIp || "-"} x-forwarded-for=${firstForwardedForIp || "-"} remote=${remoteSocketIp} count=${entry.timestamps.length}/${maxRequests} windowMs=${windowMs}`
            );
        }
        next();
    };
}

const scaffoldRateLimiter = buildRateLimiter(
    scaffoldRateLimitMax,
    scaffoldRateLimitWindowMs,
    "scaffold-download"
);
const wishlistRateLimiter = buildRateLimiter(wishlistRateLimitMax, wishlistRateLimitWindowMs, "wishlist");

app.get("/health", (_req, res) => {
    res.json({status: "ok"});
});

app.get("/api/modules", (_req, res) => {
    try {
        res.json(scaffolderService.getRuntimeConfig());
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

app.get("/api/project-options", (_req, res) => {
    try {
        res.json(scaffolderService.getProjectOptionCatalog());
    } catch {
        res.status(500).json({error: "Failed to load project options"});
    }
});

const handleWishlistRequest: express.RequestHandler = async (req, res) => {
    try {
        const email = String(req.body?.email ?? "").trim();
        const systemName = String(req.body?.systemName ?? "").trim();

        if (!email || !emailPattern.test(email)) {
            res.status(400).json({error: "Invalid email"});
            return;
        }

        if (!systemName) {
            res.status(400).json({error: "Missing systemName"});
            return;
        }

        const {created} = await createWishlistEntry(email, systemName);
        res.status(created ? 201 : 200).json({status: "ok", created});
    } catch (error) {
        console.error(
            "[scaffolder] Wishlist persistence failed:",
            error instanceof Error ? error.message : error
        );
        res.status(202).json({
            status: "accepted",
            created: false,
            persisted: false
        });
    }
};

app.post("/api/wishlist", wishlistRateLimiter, handleWishlistRequest);
app.post("/wishlist", wishlistRateLimiter, handleWishlistRequest);

function parseModules(modulesParam: string): string[] {
    return modulesParam
        .split(",")
        .map((moduleName) => moduleName.trim())
        .filter((moduleName) => moduleName.length > 0);
}

function parseBooleanQueryValue(value: unknown): unknown {
    if (value === undefined) {
        return true;
    }
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveMcpPublicOrigin(
    configuredOrigin: string | undefined,
    nodeEnvironment: string | undefined,
    configuredPort: number
): string | null {
    const originValue = configuredOrigin?.trim() || (nodeEnvironment === "production" ? "" : `http://127.0.0.1:${configuredPort}`);
    if (!originValue) {
        return null;
    }

    try {
        const parsedOrigin = new URL(originValue);
        if (
            (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") ||
            parsedOrigin.username !== "" ||
            parsedOrigin.password !== "" ||
            parsedOrigin.pathname !== "/" ||
            parsedOrigin.search !== "" ||
            parsedOrigin.hash !== ""
        ) {
            return null;
        }
        return parsedOrigin.origin;
    } catch {
        return null;
    }
}

function readBoundedNumber(
    rawValue: string | undefined,
    fallback: number,
    minimum: number,
    maximum: number
): number {
    if (rawValue === undefined) {
        return fallback;
    }
    const parsedValue = Number(rawValue);
    if (!Number.isInteger(parsedValue) || parsedValue < minimum || parsedValue > maximum) {
        return fallback;
    }
    return parsedValue;
}

const handleLegacyScaffoldRequest: express.RequestHandler = async (req, res) => {
    try {
        const modulesParam = String(req.query.modules ?? "").trim();
        if (parseModules(modulesParam).length === 0) {
            res.status(400).json({error: "Missing modules query param"});
            return;
        }

        const zipName = String(req.query.name ?? "").trim();
        const counterName = String(req.query.counterName ?? "").trim();
        const projectSpec: Record<string, unknown> = {
            schemaVersion: 1,
            projectName: zipName || "backend",
            modules: parseModules(modulesParam),
            targetPlatform: req.query.targetPlatform === undefined
                ? "linux"
                : String(req.query.targetPlatform),
            demoInsertsEnabled: parseBooleanQueryValue(req.query.demoInsertsEnabled)
        };
        const templateId = String(req.query.templateId ?? "").trim();
        if (templateId) {
            projectSpec.templateId = templateId;
        }

        await sendScaffoldArchive(res, projectSpec, counterName, zipName.length > 0);
    } catch (error) {
        if (res.headersSent) {
            return;
        }
        res.status(500).json({
            error: "Failed to generate scaffold"
        });
    }
};

const handleProjectScaffoldRequest: express.RequestHandler = async (req, res) => {
    const requestBody = req.body;
    if (!isRecord(requestBody)) {
        res.status(400).json({
            error: "Invalid request body",
            errors: [{field: "body", code: "invalid_type", message: "Request body must be an object."}]
        });
        return;
    }

    const unsupportedFields = Object.keys(requestBody).filter((field) => {
        return field !== "projectSpec" && field !== "counterName";
    });
    if (unsupportedFields.length > 0) {
        res.status(400).json({
            error: "Invalid request body",
            errors: unsupportedFields.map((field) => ({
                field,
                code: "unknown_field",
                message: `Unknown request field: ${field}.`
            }))
        });
        return;
    }

    if (requestBody.counterName !== undefined && typeof requestBody.counterName !== "string") {
        res.status(400).json({
            error: "Invalid request body",
            errors: [{field: "counterName", code: "invalid_type", message: "counterName must be a string."}]
        });
        return;
    }

    await sendScaffoldArchive(
        res,
        requestBody.projectSpec,
        String(requestBody.counterName ?? "").trim(),
        true
    ).catch(() => {
        if (!res.headersSent) {
            res.status(500).json({error: "Failed to generate scaffold"});
        }
    });
};

app.get("/api/scaffold", scaffoldRateLimiter, handleLegacyScaffoldRequest);
app.get("/scaffold", scaffoldRateLimiter, handleLegacyScaffoldRequest);
app.post("/api/scaffold", scaffoldRateLimiter, handleProjectScaffoldRequest);

async function sendScaffoldArchive(
    res: express.Response,
    projectSpecInput: unknown,
    counterName: string,
    isProjectNameProvided: boolean
): Promise<void> {
    const validation = scaffolderService.validateProjectSpec(projectSpecInput);
    if (!validation.valid || validation.normalizedProjectSpec === null) {
        res.status(400).json({error: "Invalid project spec", errors: validation.errors});
        return;
    }

    const optionCatalog = scaffolderService.getProjectOptionCatalog();
    const supportedCounters = new Set([
        ...optionCatalog.modules.map((moduleOption: {id: string}) => moduleOption.id),
        ...optionCatalog.templates.map((template: {id: string}) => template.id)
    ]);
    if (counterName && !supportedCounters.has(counterName)) {
        res.status(400).json({
            error: "Invalid project spec",
            errors: [{field: "counterName", code: "unsupported_value", message: "counterName is not a supported option ID."}]
        });
        return;
    }

    const projectSpec = validation.normalizedProjectSpec;
    let zipFilePath: string;
    try {
        zipFilePath = await scaffolderService.generateProject(projectSpec, {
            cacheMode: "reuse",
            isProjectNameProvided
        });
    } catch (cacheError) {
        const cacheErrorMessage = cacheError instanceof Error ? cacheError.message : "";
        if (!cacheErrorMessage.includes("Base cache missing")) {
            throw cacheError;
        }
        zipFilePath = await scaffolderService.generateProject(projectSpec, {
            cacheMode: "rebuild",
            isProjectNameProvided
        });
    }

    res.download(zipFilePath, (downloadError) => {
        if (downloadError) {
            if (!res.headersSent) {
                res.status(500).json({error: "Failed to send scaffold"});
            }
            return;
        }

        const counterNamesToIncrement = counterName ? [counterName] : projectSpec.modules;
        void incrementDownloadCounters(counterNamesToIncrement).catch(() => {
            console.error("[scaffolder] Failed to increment download counters.");
        });
    });
}

export async function startServer(): Promise<void> {
    const configuredDatabaseUrl = getConfiguredDatabaseUrl();
    if (!configuredDatabaseUrl) {
        console.warn("[scaffolder] DATABASE_URL/database_url is not set. DB features are disabled.");
    } else {
        try {
            const parsedUrl = new URL(configuredDatabaseUrl);
            const databaseName = parsedUrl.pathname.replace(/^\/+/, "") || "(default)";
            const maskedHost = parsedUrl.hostname || "(unknown-host)";
            const maskedPort = parsedUrl.port ? `:${parsedUrl.port}` : "";
            const maskedProtocol = parsedUrl.protocol.replace(":", "");
            const dbTarget = `${maskedProtocol}://${maskedHost}${maskedPort}/${databaseName}`;
            console.log(`[scaffolder] Database target: ${dbTarget}`);
        } catch {
            console.log("[scaffolder] Database target: <unparseable DATABASE_URL>");
        }
    }

    try {
        await initializeDatabaseSchema();
        console.log("[scaffolder] Database schema bootstrap: OK");
    } catch (error) {
        console.error(
            "[scaffolder] Database bootstrap failed. Continuing without database-backed features:",
            error instanceof Error ? error.message : error
        );
    }
    await artifactStoreReady.catch(() => undefined);
    app.listen(port, () => {
        console.log(`[scaffolder] Server running on port ${port}`);
    });
}

if (require.main === module) {
    void startServer();
}
