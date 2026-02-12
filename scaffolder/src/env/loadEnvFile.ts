import fs from "fs";
import path from "path";

function stripWrappingQuotes(value: string): string {
    const trimmedValue = value.trim();
    const hasDoubleQuotes = trimmedValue.startsWith("\"") && trimmedValue.endsWith("\"");
    const hasSingleQuotes = trimmedValue.startsWith("'") && trimmedValue.endsWith("'");

    if (hasDoubleQuotes || hasSingleQuotes) {
        return trimmedValue.slice(1, -1);
    }

    return trimmedValue;
}

export function loadEnvFile(): void {
    const envFilePath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envFilePath)) {
        return;
    }

    const envFileContents = fs.readFileSync(envFilePath, "utf8");
    const lines = envFileContents.split(/\r?\n/);

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) {
            continue;
        }

        const delimiterIndex = trimmedLine.indexOf("=");
        if (delimiterIndex <= 0) {
            continue;
        }

        const key = trimmedLine.slice(0, delimiterIndex).trim();
        const rawValue = trimmedLine.slice(delimiterIndex + 1);
        if (!key || process.env[key] !== undefined) {
            continue;
        }

        process.env[key] = stripWrappingQuotes(rawValue);
    }
}
