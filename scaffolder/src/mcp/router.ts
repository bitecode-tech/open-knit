import fs from "fs";
import express, {type NextFunction, type Request, type Response, type Router} from "express";
import {ArtifactStore} from "./artifactStore";
import {McpAbuseLimiter, normalizeClientIp} from "./abuseLimiter";
import {createMcpHttpHandler} from "./httpHandler";
import type {ProjectGenerationService} from "./projectTools";
import {CANONICAL_INSTRUCTIONS_DOCUMENT} from "@/guidance/instructions";

export interface McpRouterOptions {
    projectService: ProjectGenerationService;
    artifactStore: ArtifactStore;
    abuseLimiter: McpAbuseLimiter;
    publicOrigin: string | null;
    allowedOrigins: readonly string[];
    generationTimeoutMs: number;
    artifactStoreReady: Promise<void>;
}

export function createMcpRouter(options: McpRouterOptions): Router {
    const router = express.Router();
    const allowedOrigins = new Set(
        [...options.allowedOrigins, ...(options.publicOrigin ? [options.publicOrigin] : [])]
            .map(normalizeOrigin)
            .filter((origin): origin is string => origin !== null)
    );

    router.use("/mcp", validateMcpOrigin(allowedOrigins));
    router.use("/mcp", express.json({limit: 16 * 1024, type: "application/json"}));

    router.get("/api/instructions", (_req, res) => {
        res.setHeader("Cache-Control", "public, max-age=300");
        res.setHeader("ETag", '"' + CANONICAL_INSTRUCTIONS_DOCUMENT.sha256 + '"');
        res.setHeader("Last-Modified", new Date(CANONICAL_INSTRUCTIONS_DOCUMENT.lastModified).toUTCString());
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.status(200).type("application/json").json(CANONICAL_INSTRUCTIONS_DOCUMENT);
    });

    router.options("/mcp", (_req, res) => {
        res.sendStatus(204);
    });
    router.get("/mcp", (_req, res) => sendMethodNotAllowed(res));
    router.delete("/mcp", (_req, res) => sendMethodNotAllowed(res));
    router.post("/mcp", options.abuseLimiter.middleware(), async (req, res, next) => {
        try {
            await createMcpHttpHandler({
                projectService: options.projectService,
                artifactStore: options.artifactStore,
                abuseLimiter: options.abuseLimiter,
                publicOrigin: options.publicOrigin,
                generationTimeoutMs: options.generationTimeoutMs,
                getClientIp: () => normalizeClientIp(req.ip || req.socket.remoteAddress || "unknown")
            })(req, res, next);
        } catch (error) {
            next(error);
        }
    });
    router.all("/mcp", (_req, res) => sendMethodNotAllowed(res));

    router.get("/api/artifacts/:artifactId", options.abuseLimiter.artifactDownloadMiddleware(), async (req, res) => {
        try {
            await options.artifactStoreReady;
            const artifact = await options.artifactStore.getAvailableArtifact(req.params.artifactId ?? "");
            if (!artifact) {
                res.status(404).json({error: "Artifact not found or expired"});
                return;
            }

            const archivePath = options.artifactStore.getArchivePath(artifact.id);
            res.setHeader("Cache-Control", "private, no-store, max-age=0");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Length", String(artifact.byteSize));
            res.setHeader("Content-Disposition", 'attachment; filename="open-knit-project.zip"');

            const archiveStream = fs.createReadStream(archivePath);
            archiveStream.on("error", () => {
                if (!res.headersSent) {
                    res.status(404).json({error: "Artifact not found or expired"});
                } else {
                    res.destroy();
                }
            });
            archiveStream.pipe(res);
        } catch {
            if (!res.headersSent) {
                res.status(500).json({error: "Artifact retrieval failed"});
            }
        }
    });

    router.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (!req.originalUrl.startsWith("/mcp")) {
            next(error);
            return;
        }

        const errorType = getErrorType(error);
        const isTooLarge = errorType === "entity.too.large";
        res.status(isTooLarge ? 413 : 400).json({
            jsonrpc: "2.0",
            id: null,
            error: {
                code: isTooLarge ? -32000 : -32700,
                message: isTooLarge ? "MCP request exceeds the 16 KiB limit." : "Malformed MCP request."
            }
        });
    });

    return router;
}

function validateMcpOrigin(allowedOrigins: ReadonlySet<string>): express.RequestHandler {
    return (req, res, next) => {
        const rawOrigin = req.header("Origin");
        if (rawOrigin) {
            const normalizedOrigin = normalizeOrigin(rawOrigin);
            if (!normalizedOrigin || !allowedOrigins.has(normalizedOrigin)) {
                res.status(403).json({
                    jsonrpc: "2.0",
                    id: null,
                    error: {code: -32000, message: "Origin is not allowed for this MCP endpoint."}
                });
                return;
            }

            res.setHeader("Access-Control-Allow-Origin", normalizedOrigin);
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader(
                "Access-Control-Allow-Headers",
                "Accept, Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID"
            );
            res.setHeader("Access-Control-Expose-Headers", "Content-Type, MCP-Protocol-Version, MCP-Session-Id");
            res.setHeader("Vary", "Origin");
        }
        next();
    };
}

function normalizeOrigin(rawOrigin: string): string | null {
    try {
        const parsedOrigin = new URL(rawOrigin);
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

function sendMethodNotAllowed(res: Response): void {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({error: "Method not allowed"});
}

function getErrorType(error: unknown): string | null {
    if (typeof error !== "object" || error === null || !("type" in error)) {
        return null;
    }
    const errorType = (error as {type?: unknown}).type;
    return typeof errorType === "string" ? errorType : null;
}
