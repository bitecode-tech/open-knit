export type Data = {
    mcpEndpoint: string;
};

export default function data(): Data {
    const publicOrigin = process.env.MCP_PUBLIC_ORIGIN?.trim() || "https://open-knit.com";

    return {
        mcpEndpoint: new URL("/mcp", publicOrigin).toString()
    };
}
