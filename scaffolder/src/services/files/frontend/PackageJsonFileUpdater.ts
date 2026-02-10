class PackageJsonFileUpdater {
    updateContents(packageJsonContents: string, appName: string): string {
        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(packageJsonContents) as Record<string, unknown>;
        } catch (error) {
            throw new Error("Failed to parse frontend package.json");
        }

        parsed.name = appName;
        return `${JSON.stringify(parsed, null, 2)}\n`;
    }
}

const packageJsonFileUpdater = new PackageJsonFileUpdater();
export default packageJsonFileUpdater;
