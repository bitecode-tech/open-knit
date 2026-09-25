class PackageJsonFileUpdater {
    updateContents(packageJsonContents: string, appName: string, nodeVersion: string): string {
        let parsedValue: unknown;
        try {
            parsedValue = JSON.parse(packageJsonContents) as unknown;
        } catch {
            throw new Error("Failed to parse frontend package.json");
        }
        if (typeof parsedValue !== "object" || parsedValue === null || Array.isArray(parsedValue)) {
            throw new Error("Frontend package.json must contain an object.");
        }
        const parsed = parsedValue as Record<string, unknown>;

        parsed.name = appName;
        const currentEngines = typeof parsed.engines === "object" && parsed.engines !== null && !Array.isArray(parsed.engines)
            ? parsed.engines as Record<string, unknown>
            : {};
        parsed.engines = {
            ...currentEngines,
            ...(typeof currentEngines.node === "string" && currentEngines.node.trim()
                ? {}
                : {node: nodeVersion})
        };
        return `${JSON.stringify(parsed, null, 2)}\n`;
    }
}

const packageJsonFileUpdater = new PackageJsonFileUpdater();
export default packageJsonFileUpdater;
