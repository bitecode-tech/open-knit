import path from "path";
import {register} from "tsconfig-paths";
import express from "express";

register({
    baseUrl: path.resolve(__dirname),
    paths: {
        "@/*": ["*"]
    }
});

const scaffolderService = require("@/services/ScaffolderService").default;

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT ?? 7070);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 3);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 30_000);

type RateLimitEntry = {
    timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", corsOrigin);
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});

const scaffoldRateLimiter: express.RequestHandler = (req, res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(key) ?? {timestamps: []};
    entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= rateLimitWindowMs);
    if (entry.timestamps.length >= rateLimitMax) {
        res.status(429).json({error: "Too many requests"});
        return;
    }
    entry.timestamps.push(now);
    rateLimitStore.set(key, entry);
    next();
};

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

const handleScaffoldRequest: express.RequestHandler = async (req, res) => {
    try {
        const modulesParam = String(req.query.modules ?? "").trim();
        if (!modulesParam) {
            res.status(400).json({error: "Missing modules query param"});
            return;
        }
        const nameParam = String(req.query.name ?? "").trim();
        const args: string[] = [`modules=${modulesParam}`];
        if (nameParam) {
            args.push(`name=${nameParam}`);
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
        res.download(zipFilePath);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

app.get("/api/scaffold", scaffoldRateLimiter, handleScaffoldRequest);
app.get("/scaffold", scaffoldRateLimiter, handleScaffoldRequest);

app.listen(port, () => {
    console.log(`[scaffolder] Server running on port ${port}`);
});
