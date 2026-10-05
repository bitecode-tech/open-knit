import path from "path";
import {register} from "tsconfig-paths";
import express from "express";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import artifactStore from "./mcp/artifactStore";
import {createProjectMcpServer} from "./mcp/projectMcpServer";
import {loadEnvFile} from "./env/loadEnvFile";
import {installTimestampedConsole} from "./logging/installTimestampedConsole";

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

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT ?? 7070);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const scaffoldRateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 3);
const scaffoldRateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 30_000);
const mcpRateLimitMax = Number(process.env.MCP_RATE_LIMIT_MAX ?? 0);
const mcpRateLimitWindowMs = Number(process.env.MCP_RATE_LIMIT_WINDOW_MS ?? scaffoldRateLimitWindowMs);
const mcpAllowedOrigins = (process.env.MCP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const enableRateLimitDiagnostics = process.env.RATE_LIMIT_DIAGNOSTICS === "true";
const wishlistRateLimitMax = 3;
const wishlistRateLimitWindowMs = 30_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

app.use(express.json({limit: "16kb"}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", corsOrigin);
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID"
    );
    res.header("Access-Control-Expose-Headers", "MCP-Session-Id");
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
const mcpRateLimiter: express.RequestHandler = mcpRateLimitMax > 0
    ? buildRateLimiter(mcpRateLimitMax, mcpRateLimitWindowMs, "mcp")
    : (_req, _res, next) => next();
const wishlistRateLimiter = buildRateLimiter(wishlistRateLimitMax, wishlistRateLimitWindowMs, "wishlist");

function incrementDownloadCountersAfterSend(counterNames: string[]): void {
    void incrementDownloadCounters(counterNames).catch((counterError: unknown) => {
        console.error(
            "[scaffolder] Failed to increment download counters:",
            counterError instanceof Error ? counterError.message : counterError
        );
    });
}

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

const handleScaffoldRequest: express.RequestHandler = async (req, res) => {
    try {
        const modulesParam = String(req.query.modules ?? "").trim();
        const moduleNames = parseModules(modulesParam);
        if (moduleNames.length === 0) {
            res.status(400).json({error: "Missing modules query param"});
            return;
        }

        const zipName = String(req.query.name ?? "").trim();
        const counterName = String(req.query.counterName ?? "").trim();

        const args: string[] = [`modules=${moduleNames.join(",")}`];
        if (zipName) {
            args.push(`name=${zipName}`);
        }

        let zipFilePath: string;
        try {
            zipFilePath = await scaffolderService.run(args, {cacheMode: "reuse"});
        } catch (cacheError) {
            const cacheErrorMessage = cacheError instanceof Error ? cacheError.message : "";
            if (!cacheErrorMessage.includes("Base cache missing")) {
                throw cacheError;
            }
            zipFilePath = await scaffolderService.run(args, {cacheMode: "rebuild"});
        }

        res.download(zipFilePath, (downloadError) => {
            if (downloadError) {
                if (!res.headersSent) {
                    res.status(500).json({error: "Failed to send scaffold"});
                }
                return;
            }

            const counterNamesToIncrement = counterName ? [counterName] : moduleNames;
            incrementDownloadCountersAfterSend(counterNamesToIncrement);
        });
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

app.get("/api/scaffold", scaffoldRateLimiter, handleScaffoldRequest);
app.get("/scaffold", scaffoldRateLimiter, handleScaffoldRequest);

app.all("/mcp", mcpRateLimiter, async (req, res) => {
    const origin = req.headers.origin;
    if (origin && mcpAllowedOrigins.length > 0 && !mcpAllowedOrigins.includes(origin)) {
        res.status(403).json({error: "Origin is not allowed for the MCP endpoint"});
        return;
    }

    try {
        const configuredPublicOrigin = process.env.MCP_PUBLIC_ORIGIN?.trim() || "https://open-knit.com";
        const publicOriginUrl = new URL(configuredPublicOrigin);
        if (!["http:", "https:"].includes(publicOriginUrl.protocol)) {
            res.status(500).json({error: "MCP_PUBLIC_ORIGIN must use HTTP or HTTPS"});
            return;
        }
        const publicOrigin = publicOriginUrl.origin;
        const mcpServer = createProjectMcpServer(
            scaffolderService,
            scaffolderService.getPathsConfig(),
            publicOrigin
        );
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
            ...(mcpAllowedOrigins.length > 0 ? {allowedOrigins: mcpAllowedOrigins} : {})
        });
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
        await transport.close();
        await mcpServer.close();
    } catch (error) {
        console.error(
            "[scaffolder] MCP request failed:",
            error instanceof Error ? error.message : "Unknown error"
        );
        if (!res.headersSent) {
            res.status(500).json({error: "MCP request failed"});
        }
    }
});

const handleMcpArtifactDownload: express.RequestHandler = (req, res) => {
    const token = String(req.params.token ?? "");
    if (!/^[a-f0-9]{64}$/.test(token)) {
        res.status(404).json({error: "Artifact not found or expired"});
        return;
    }
    const artifact = artifactStore.get(token);
    if (!artifact) {
        res.status(404).json({error: "Artifact not found or expired"});
        return;
    }
    res.download(artifact.filePath, artifact.fileName, (downloadError) => {
        if (downloadError) {
            if (!res.headersSent) {
                res.status(500).json({error: "Failed to send generated project"});
            }
            return;
        }

        incrementDownloadCountersAfterSend(artifact.moduleNames);
    });
};

app.get("/mcp/artifacts/:token", handleMcpArtifactDownload);
app.get("/api/mcp/artifacts/:token", handleMcpArtifactDownload);

async function startServer() {
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
    app.listen(port, () => {
        console.log(`[scaffolder] Server running on port ${port}`);
    });
}

void startServer();
