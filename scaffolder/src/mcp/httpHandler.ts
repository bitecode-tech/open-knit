import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type {RequestHandler} from "express";
import {createProjectMcpServer, type ProjectToolDependencies} from "./projectTools";

export function createMcpHttpHandler(dependencies: ProjectToolDependencies): RequestHandler {
    return async (req, res) => {
        const server = createProjectMcpServer(dependencies);
        const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined});
        try {
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch {
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    id: requestId(req.body),
                    error: {code: -32603, message: "MCP request could not be completed."}
                });
            }
        } finally {
            await server.close().catch(() => undefined);
        }
    };
}

function requestId(body: unknown): string | number | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return null;
    }
    const id = (body as {id?: unknown}).id;
    return typeof id === "string" || typeof id === "number" ? id : null;
}
