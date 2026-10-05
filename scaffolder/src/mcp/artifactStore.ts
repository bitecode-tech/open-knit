import crypto from "crypto";
import fs from "fs";
import path from "path";

const ARTIFACT_TTL_MS = 30 * 60 * 1000;
const MAX_ACTIVE_ARTIFACTS = 100;

interface StoredArtifact {
    filePath: string;
    fileName: string;
    moduleNames: string[];
    expiresAt: number;
}

export interface GeneratedArtifact {
    token: string;
    fileName: string;
    expiresAt: string;
}

export class ArtifactStore {
    private readonly artifacts = new Map<string, StoredArtifact>();

    async create(filePath: string, moduleNames: string[]): Promise<GeneratedArtifact> {
        this.removeExpired();
        if (this.artifacts.size >= MAX_ACTIVE_ARTIFACTS) {
            const firstToken = this.artifacts.keys().next().value;
            if (firstToken) {
                const firstArtifact = this.artifacts.get(firstToken);
                this.artifacts.delete(firstToken);
                if (firstArtifact) {
                    fs.rmSync(firstArtifact.filePath, {force: true});
                }
            }
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + ARTIFACT_TTL_MS;
        const fileName = path.basename(filePath);
        const artifactDirectory = path.join(path.dirname(filePath), ".mcp-artifacts");
        const artifactPath = path.join(artifactDirectory, `${token}.zip`);
        await fs.promises.mkdir(artifactDirectory, {recursive: true});
        await fs.promises.copyFile(filePath, artifactPath);
        this.artifacts.set(token, {
            filePath: artifactPath,
            fileName,
            moduleNames: [...moduleNames],
            expiresAt
        });

        return {token, fileName, expiresAt: new Date(expiresAt).toISOString()};
    }

    get(token: string): StoredArtifact | null {
        this.removeExpired();
        const artifact = this.artifacts.get(token);
        if (!artifact || !fs.existsSync(artifact.filePath)) {
            this.artifacts.delete(token);
            return null;
        }
        return artifact;
    }

    private removeExpired(): void {
        const currentTime = Date.now();
        for (const [token, artifact] of this.artifacts) {
            if (artifact.expiresAt <= currentTime || !fs.existsSync(artifact.filePath)) {
                this.artifacts.delete(token);
                fs.rmSync(artifact.filePath, {force: true});
            }
        }
    }
}

const artifactStore = new ArtifactStore();
export default artifactStore;
