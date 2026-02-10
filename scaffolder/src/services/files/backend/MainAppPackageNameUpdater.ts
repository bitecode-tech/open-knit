import fs from "fs";
import path from "path";

class MainAppPackageNameUpdater {
    resolveSourcePackageName(mainJavaRoot: string): string | null {
        if (!fs.existsSync(mainJavaRoot)) {
            return null;
        }

        const applicationPath = this.findApplicationFile(mainJavaRoot);
        if (!applicationPath) {
            return null;
        }

        const contents = fs.readFileSync(applicationPath, "utf8");
        const match = contents.match(/^\s*package\s+([a-zA-Z0-9_.]+)\s*;/m);
        if (!match) {
            return null;
        }

        return match[1];
    }

    buildTargetPackageName(applicationName: string): string {
        const trimmedName = applicationName.trim();
        if (!trimmedName) {
            return "backend";
        }
        return this.toCamelCase(trimmedName);
    }

    buildPackagePath(packageName: string): string {
        return packageName.split(".").join(path.sep);
    }

    private findApplicationFile(rootPath: string): string | null {
        const entries = fs.readdirSync(rootPath, {withFileTypes: true});
        for (const entry of entries) {
            const entryPath = path.join(rootPath, entry.name);
            if (entry.isDirectory()) {
                const result = this.findApplicationFile(entryPath);
                if (result) {
                    return result;
                }
                continue;
            }
            if (entry.isFile() && entry.name === "Application.java") {
                return entryPath;
            }
        }
        return null;
    }

    private toCamelCase(value: string): string {
        const parts = value.split(/[^a-zA-Z0-9]+/).filter((part) => part.length > 0);
        if (parts.length === 0) {
            return "";
        }
        const [firstPart, ...restParts] = parts;
        const firstLower = firstPart.toLowerCase();
        const rest = restParts.map((part) => {
            const lower = part.toLowerCase();
            return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
        });
        return `${firstLower}${rest.join("")}`;
    }
}

const mainAppPackageNameUpdater = new MainAppPackageNameUpdater();
export default mainAppPackageNameUpdater;
