import {useState} from "react";

type McpConnectCardProps = {
    endpoint: string;
};

type CopyStatus = "idle" | "copied" | "failed";

export default function McpConnectCard({endpoint}: McpConnectCardProps) {
    const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

    const copyEndpoint = async () => {
        try {
            await navigator.clipboard.writeText(endpoint);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("failed");
        }
    };

    return (
        <aside className="landing-mcp-connect" aria-labelledby="landing-mcp-title">
            <div className="landing-mcp-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                    <path d="m19.2 28.8 9.6-9.6a7.1 7.1 0 0 1 10 10l-6.1 6.1a7.1 7.1 0 0 1-10 0" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
                    <path d="m28.8 19.2-9.6 9.6a7.1 7.1 0 0 1-10-10l6.1-6.1a7.1 7.1 0 0 1 10 0" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
                </svg>
            </div>

            <div className="landing-mcp-copy">
                <h2 id="landing-mcp-title">Connect through MCP</h2>
                <p>Through MCP, you can learn, get development guidance, and create an application base.</p>
            </div>

            <div className="landing-mcp-divider" aria-hidden="true"/>

            <div className="landing-mcp-endpoint-section">
                <div className="landing-mcp-endpoint-field">
                    <code>{endpoint}</code>
                    <button
                        className="landing-mcp-copy-button"
                        type="button"
                        aria-label={copyStatus === "copied" ? "MCP endpoint copied" : "Copy MCP endpoint"}
                        onClick={copyEndpoint}
                    >
                        {copyStatus === "copied" ? <CopySuccessIcon/> : <CopyIcon/>}
                    </button>
                </div>
                <p className="landing-mcp-caption">
                    <span aria-hidden="true">✦</span>
                    Works with your AI tools
                    <span className="landing-mcp-caption-divider" aria-hidden="true">•</span>
                    Copy the address and connect instantly.
                </p>
                <span className="landing-sr-only" role="status" aria-live="polite">
                    {copyStatus === "copied" ? "MCP endpoint copied to clipboard." : ""}
                    {copyStatus === "failed" ? "Could not copy the MCP endpoint." : ""}
                </span>
            </div>
        </aside>
    );
}

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
    );
}

function CopySuccessIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
