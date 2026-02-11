import path from "path";
import {fileURLToPath} from "url";
import express from "express";
import {createProxyMiddleware} from "http-proxy-middleware";
import {createDevMiddleware, renderPage} from "vike/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";
const appRoot = isProd ? path.resolve(__dirname, "..", "..") : path.resolve(__dirname, "..");

const port = Number(process.env.PORT ?? 3000);
const apiBaseUrl = process.env.SCAFFOLDER_API_URL ?? "http://127.0.0.1:7070";

async function startServer() {
    const app = express();

    app.use(
        "/api",
        createProxyMiddleware({
            target: apiBaseUrl,
            changeOrigin: true,
            xfwd: true
        })
    );

    if (!isProd) {
        const {devMiddleware} = await createDevMiddleware({root: appRoot});
        app.use(devMiddleware);
    } else {
        app.use(express.static(path.join(appRoot, "dist", "client")));
    }

    app.get("*", async (req, res, next) => {
        const pageContextInit = {urlOriginal: req.originalUrl};
        const pageContext = await renderPage(pageContextInit);
        const {httpResponse} = pageContext;
        if (!httpResponse) {
            next();
            return;
        }

        const {body, statusCode, headers, pipe} = httpResponse;
        headers.forEach(([name, value]) => res.setHeader(name, value));
        res.status(statusCode);
        if (pipe) {
            pipe(res);
        } else {
            res.send(body);
        }
    });

    app.listen(port, () => {
        console.log(`[scaffolder-ui] Server running on port ${port} (http://localhost:${port})`);
    });
}

startServer().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
