import crypto from "crypto";

class EnvFileService {
    buildFromTemplate(
        templateContents: string,
        options: {includeJwtSecret?: boolean; demoInsertsEnabled?: boolean} = {}
    ): string {
        const includeJwtSecret = options.includeJwtSecret ?? true;
        const demoInsertsEnabled = options.demoInsertsEnabled;
        const secretKeyPattern = /^BITECODE_JWT_SECRET_KEY=.*$/m;

        let generatedContents = templateContents;
        if (includeJwtSecret) {
            const secretValue = this.generateSecretValue();
            generatedContents = secretKeyPattern.test(generatedContents)
                ? generatedContents.replace(secretKeyPattern, `BITECODE_JWT_SECRET_KEY=${secretValue}`)
                : `${generatedContents.trimEnd()}\nBITECODE_JWT_SECRET_KEY=${secretValue}\n`;
        } else {
            generatedContents = generatedContents.replace(secretKeyPattern, "").replace(/\n{2,}/g, "\n");
        }

        if (demoInsertsEnabled !== undefined) {
            const demoInsertFlagPattern = /^DEMO_INSERTS_ENABLED=.*$/m;
            generatedContents = demoInsertFlagPattern.test(generatedContents)
                ? generatedContents.replace(demoInsertFlagPattern, `DEMO_INSERTS_ENABLED=${demoInsertsEnabled}`)
                : `${generatedContents.trimEnd()}\nDEMO_INSERTS_ENABLED=${demoInsertsEnabled}\n`;
        }

        return generatedContents;
    }

    private generateSecretValue(): string {
        return crypto.randomBytes(64).toString("hex");
    }
}

const envFileService = new EnvFileService();
export default envFileService;
