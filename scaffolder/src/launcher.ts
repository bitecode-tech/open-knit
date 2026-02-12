import path from "path";
import {spawn} from "child_process";
import {loadEnvFile} from "./env/loadEnvFile";
import {installTimestampedConsole} from "./logging/installTimestampedConsole";

installTimestampedConsole();

loadEnvFile();

const backendPort = process.env.SCAFFOLDER_PORT ?? "7070";
const uiPort = process.env.UI_PORT ?? "3000";
const apiBaseUrl = process.env.SCAFFOLDER_API_URL ?? `http://127.0.0.1:${backendPort}`;

const backendProcess = spawn(process.execPath, [path.resolve(__dirname, "server.js")], {
    stdio: "inherit",
    env: {
        ...process.env,
        PORT: backendPort
    }
});

const uiProcess = spawn(
    process.execPath,
    [path.resolve(__dirname, "..", "ui", "dist", "ssr-server", "index.js")],
    {
        stdio: "inherit",
        cwd: path.resolve(__dirname, "..", "ui"),
        env: {
            ...process.env,
            PORT: uiPort,
            SCAFFOLDER_API_URL: apiBaseUrl,
            NODE_ENV: process.env.NODE_ENV ?? "production"
        }
    }
);

const shutdown = (signal: NodeJS.Signals) => {
    backendProcess.kill(signal);
    uiProcess.kill(signal);
};

let shuttingDown = false;
const handleExit = (code: number | null) => {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    uiProcess.kill("SIGTERM");
    backendProcess.kill("SIGTERM");
    if (code && code > 0) {
        process.exit(code);
        return;
    }
    process.exit(0);
};

backendProcess.on("exit", handleExit);
uiProcess.on("exit", handleExit);

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
