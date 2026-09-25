import type {NextFunction, Request, Response, RequestHandler} from "express";

interface ClientState {
    requestTimestamps: number[];
    generationTimestamps: number[];
    artifactDownloadTimestamps: number[];
    activeRequests: number;
    activeGenerations: number;
    activeArtifactDownloads: number;
    lastSeenAt: number;
}

export interface McpAbuseLimiterOptions {
    maxRequestsPerWindow?: number;
    requestWindowMs?: number;
    maxGenerationRequestsPerWindow?: number;
    generationWindowMs?: number;
    maxActiveRequestsPerClient?: number;
    maxActiveGenerationsPerClient?: number;
    maxActiveGenerationsTotal?: number;
    maxArtifactDownloadsPerWindow?: number;
    artifactDownloadWindowMs?: number;
    maxActiveArtifactDownloadsPerClient?: number;
    now?: () => number;
}

export class McpAbuseLimiter {
    private readonly maxRequestsPerWindow: number;
    private readonly requestWindowMs: number;
    private readonly maxGenerationRequestsPerWindow: number;
    private readonly generationWindowMs: number;
    private readonly maxActiveRequestsPerClient: number;
    private readonly maxActiveGenerationsPerClient: number;
    private readonly maxActiveGenerationsTotal: number;
    private readonly maxArtifactDownloadsPerWindow: number;
    private readonly artifactDownloadWindowMs: number;
    private readonly maxActiveArtifactDownloadsPerClient: number;
    private readonly now: () => number;
    private readonly clients = new Map<string, ClientState>();
    private activeGenerationsTotal = 0;

    constructor(options: McpAbuseLimiterOptions = {}) {
        this.maxRequestsPerWindow = options.maxRequestsPerWindow ?? 60;
        this.requestWindowMs = options.requestWindowMs ?? 60_000;
        this.maxGenerationRequestsPerWindow = options.maxGenerationRequestsPerWindow ?? 3;
        this.generationWindowMs = options.generationWindowMs ?? 30 * 60_000;
        this.maxActiveRequestsPerClient = options.maxActiveRequestsPerClient ?? 8;
        this.maxActiveGenerationsPerClient = options.maxActiveGenerationsPerClient ?? 1;
        this.maxActiveGenerationsTotal = options.maxActiveGenerationsTotal ?? 1;
        this.maxArtifactDownloadsPerWindow = options.maxArtifactDownloadsPerWindow ?? 30;
        this.artifactDownloadWindowMs = options.artifactDownloadWindowMs ?? 10 * 60_000;
        this.maxActiveArtifactDownloadsPerClient = options.maxActiveArtifactDownloadsPerClient ?? 2;
        this.now = options.now ?? Date.now;
    }

    middleware(): RequestHandler {
        return (req, res, next) => {
            this.handleRequestLimit(req, res, next);
        };
    }

    artifactDownloadMiddleware(): RequestHandler {
        return (req, res, next) => {
            const clientIp = normalizeClientIp(req.ip || req.socket.remoteAddress || "unknown");
            const state = this.getClientState(clientIp);
            const now = this.now();
            state.artifactDownloadTimestamps = state.artifactDownloadTimestamps.filter((timestamp) => {
                return now - timestamp < this.artifactDownloadWindowMs;
            });
            if (state.artifactDownloadTimestamps.length >= this.maxArtifactDownloadsPerWindow) {
                this.sendRateLimitResponse(
                    req,
                    res,
                    "Artifact download rate limit exceeded.",
                    state.artifactDownloadTimestamps[0],
                    this.artifactDownloadWindowMs
                );
                return;
            }
            if (state.activeArtifactDownloads >= this.maxActiveArtifactDownloadsPerClient) {
                this.sendRateLimitResponse(
                    req,
                    res,
                    "Too many concurrent artifact downloads for this client.",
                    now,
                    1000
                );
                return;
            }

            state.artifactDownloadTimestamps.push(now);
            state.activeArtifactDownloads += 1;
            state.lastSeenAt = now;
            let released = false;
            const releaseDownload = (): void => {
                if (released) {
                    return;
                }
                released = true;
                state.activeArtifactDownloads = Math.max(0, state.activeArtifactDownloads - 1);
                state.lastSeenAt = this.now();
            };
            res.on("finish", releaseDownload);
            res.on("close", releaseDownload);
            next();
        };
    }

    acquireGenerationSlot(clientIp: string): (() => void) | null {
        const state = this.getClientState(clientIp);
        if (
            state.activeGenerations >= this.maxActiveGenerationsPerClient ||
            this.activeGenerationsTotal >= this.maxActiveGenerationsTotal
        ) {
            return null;
        }

        state.activeGenerations += 1;
        this.activeGenerationsTotal += 1;
        let released = false;
        return () => {
            if (released) {
                return;
            }
            released = true;
            state.activeGenerations = Math.max(0, state.activeGenerations - 1);
            this.activeGenerationsTotal = Math.max(0, this.activeGenerationsTotal - 1);
            state.lastSeenAt = this.now();
        };
    }

    private handleRequestLimit(req: Request, res: Response, next: NextFunction): void {
        const clientIp = normalizeClientIp(req.ip || req.socket.remoteAddress || "unknown");
        const state = this.getClientState(clientIp);
        const now = this.now();
        state.requestTimestamps = state.requestTimestamps.filter((timestamp) => now - timestamp < this.requestWindowMs);
        state.generationTimestamps = state.generationTimestamps.filter((timestamp) => now - timestamp < this.generationWindowMs);

        if (state.requestTimestamps.length >= this.maxRequestsPerWindow) {
            this.sendRateLimitResponse(req, res, "MCP request rate limit exceeded.", state.requestTimestamps[0], this.requestWindowMs);
            return;
        }
        if (state.activeRequests >= this.maxActiveRequestsPerClient) {
            this.sendRateLimitResponse(req, res, "Too many concurrent MCP requests for this client.", now, 1000);
            return;
        }

        const isGenerationRequest = isGenerateToolCall(req.body);
        if (isGenerationRequest && state.generationTimestamps.length >= this.maxGenerationRequestsPerWindow) {
            this.sendRateLimitResponse(
                req,
                res,
                "MCP generation request rate limit exceeded.",
                state.generationTimestamps[0],
                this.generationWindowMs
            );
            return;
        }

        state.requestTimestamps.push(now);
        if (isGenerationRequest) {
            state.generationTimestamps.push(now);
        }
        state.activeRequests += 1;
        state.lastSeenAt = now;
        this.pruneIdleClients();

        let released = false;
        const releaseRequest = (): void => {
            if (released) {
                return;
            }
            released = true;
            state.activeRequests = Math.max(0, state.activeRequests - 1);
            state.lastSeenAt = this.now();
        };
        res.on("finish", releaseRequest);
        res.on("close", releaseRequest);
        next();
    }

    private sendRateLimitResponse(
        req: Request,
        res: Response,
        message: string,
        windowStart: number,
        windowMs: number
    ): void {
        const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowMs - this.now()) / 1000));
        const requestId = req.body && typeof req.body === "object" ? req.body.id ?? null : null;
        res.setHeader("Retry-After", String(retryAfterSeconds));
        res.status(429).json({
            jsonrpc: "2.0",
            id: typeof requestId === "string" || typeof requestId === "number" ? requestId : null,
            error: {code: -32000, message}
        });
    }

    private getClientState(clientIp: string): ClientState {
        let state = this.clients.get(clientIp);
        if (!state) {
            state = {
                requestTimestamps: [],
                generationTimestamps: [],
                artifactDownloadTimestamps: [],
                activeRequests: 0,
                activeGenerations: 0,
                activeArtifactDownloads: 0,
                lastSeenAt: this.now()
            };
            this.clients.set(clientIp, state);
        }
        return state;
    }

    private pruneIdleClients(): void {
        const now = this.now();
        for (const [clientIp, state] of this.clients.entries()) {
            const isIdle = state.activeRequests === 0 && state.activeGenerations === 0 && state.activeArtifactDownloads === 0;
            const isOld = now - state.lastSeenAt > Math.max(this.requestWindowMs, this.generationWindowMs);
            if (isIdle && isOld) {
                this.clients.delete(clientIp);
            }
        }
    }
}

export function normalizeClientIp(clientIp: string): string {
    if (clientIp.startsWith("::ffff:")) {
        return clientIp.slice(7);
    }
    return clientIp;
}

function isGenerateToolCall(body: unknown): boolean {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return false;
    }
    const request = body as {method?: unknown; params?: unknown};
    if (request.method !== "tools/call" || typeof request.params !== "object" || request.params === null) {
        return false;
    }
    return (request.params as {name?: unknown}).name === "generate_project";
}
