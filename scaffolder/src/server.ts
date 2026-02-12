import path from "path";
import {register} from "tsconfig-paths";
import express from "express";
import {loadEnvFile} from "./env/loadEnvFile";

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

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT ?? 7070);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const scaffoldRateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 3);
const scaffoldRateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 30_000);
const wishlistRateLimitMax = 3;
const wishlistRateLimitWindowMs = 30_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RateLimitEntry = {
    timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

app.use(express.json({limit: "16kb"}));
app.use((req, res, next) => {
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
        const key = `${keyPrefix}:${req.ip ?? "unknown"}`;
        const now = Date.now();
        const entry = rateLimitStore.get(key) ?? {timestamps: []};
        entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= windowMs);

        if (entry.timestamps.length >= maxRequests) {
            res.status(429).json({error: "Too many requests"});
            return;
        }

        entry.timestamps.push(now);
        rateLimitStore.set(key, entry);
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
            void incrementDownloadCounters(counterNamesToIncrement).catch((counterError: unknown) => {
                console.error(
                    "[scaffolder] Failed to increment download counters:",
                    counterError instanceof Error ? counterError.message : counterError
                );
            });
        });
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

app.get("/api/scaffold", scaffoldRateLimiter, handleScaffoldRequest);
app.get("/scaffold", scaffoldRateLimiter, handleScaffoldRequest);

async function startServer() {
    try {
        await initializeDatabaseSchema();
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
