import crypto from "crypto";

class EnvFileService {
    buildFromTemplate(templateContents: string, options: { includeJwtSecret?: boolean } = {}): string {
        const includeJwtSecret = options.includeJwtSecret ?? true;
        const secretKeyPattern = /^BITECODE_JWT_SECRET_KEY=.*$/m;

        if (!includeJwtSecret) {
            return templateContents.replace(secretKeyPattern, "").replace(/\n{2,}/g, "\n");
        }

        const secretValue = this.generateSecretValue();
        if (secretKeyPattern.test(templateContents)) {
            return templateContents.replace(
                secretKeyPattern,
                `BITECODE_JWT_SECRET_KEY=${secretValue}`
            );
        }
        const trimmed = templateContents.trimEnd();
        const separator = trimmed.length > 0 ? "\n" : "";
        return `${trimmed}${separator}BITECODE_JWT_SECRET_KEY=${secretValue}\n`;
    }

    private generateSecretValue(): string {
        return crypto.randomBytes(64).toString("hex");
    }
}

const envFileService = new EnvFileService();
export default envFileService;
