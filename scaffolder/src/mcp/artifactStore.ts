import crypto from "crypto";
import fs from "fs";
import path from "path";
import {promisify} from "util";
import type {ProjectSpec} from "@/projectSpec/projectSpec";

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const rm = promisify(fs.rm);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

export interface StoredArtifact {
    schemaVersion: 1;
    id: string;
    createdAt: number;
    expiresAt: number;
    byteSize: number;
    checksumSha256: string;
    projectSpec: ProjectSpec;
    projectSpecDigest: string;
    idempotencyKeyDigest?: string;
}

export interface ArtifactStoreOptions {
    directory: string;
    ttlMs?: number;
    maxArtifactBytes?: number;
    maxTotalBytes?: number;
    now?: () => number;
}

export class ArtifactLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ArtifactLimitError";
    }
}

export class ArtifactStore {
    private readonly directory: string;
    private readonly ttlMs: number;
    private readonly maxArtifactBytes: number;
    private readonly maxTotalBytes: number;
    private readonly now: () => number;
    private readonly artifacts = new Map<string, StoredArtifact>();
    private totalBytes = 0;
    private reservedBytes = 0;

    constructor(options: ArtifactStoreOptions) {
        this.directory = path.resolve(options.directory);
        this.ttlMs = options.ttlMs ?? 60 * 60 * 1000;
        this.maxArtifactBytes = options.maxArtifactBytes ?? 50 * 1024 * 1024;
        this.maxTotalBytes = options.maxTotalBytes ?? 250 * 1024 * 1024;
        this.now = options.now ?? Date.now;
    }

    async initialize(): Promise<void> {
        await mkdir(this.directory, {recursive: true, mode: 0o700});
        const filenames = await readdir(this.directory);
        for (const filename of filenames) {
            if (!filename.endsWith(".json")) {
                continue;
            }

            const filePath = path.join(this.directory, filename);
            const metadata = await this.readMetadata(filePath);
            if (!metadata) {
                await rm(filePath, {force: true});
                continue;
            }
            if (metadata.expiresAt <= this.now()) {
                await this.deleteMetadataAndZip(filename.slice(0, -".json".length));
                continue;
            }

            const zipPath = this.getZipPath(metadata.id);
            try {
                const zipStats = await stat(zipPath);
                if (!zipStats.isFile() || zipStats.size !== metadata.byteSize) {
                    await this.deleteMetadataAndZip(metadata.id);
                    continue;
                }
            } catch {
                await this.deleteMetadataAndZip(metadata.id);
                continue;
            }

            this.artifacts.set(metadata.id, metadata);
            this.totalBytes += metadata.byteSize;
        }
        await this.removeUnindexedTemporaryFiles(filenames);
    }

    async findByIdempotencyKeyDigest(idempotencyKeyDigest: string): Promise<StoredArtifact | null> {
        await this.cleanupExpired();
        for (const artifact of this.artifacts.values()) {
            if (artifact.idempotencyKeyDigest === idempotencyKeyDigest) {
                return artifact;
            }
        }
        return null;
    }

    async storeGeneratedArchive(
        id: string,
        generatedArchivePath: string,
        projectSpec: ProjectSpec,
        idempotencyKeyDigest?: string
    ): Promise<StoredArtifact> {
        if (!/^[a-f0-9]{64}$/.test(id)) {
            throw new Error("Invalid generated artifact ID.");
        }

        await this.cleanupExpired();
        const sourceStats = await stat(generatedArchivePath);
        if (!sourceStats.isFile()) {
            throw new Error("Generated archive is not a regular file.");
        }
        if (sourceStats.size > this.maxArtifactBytes) {
            throw new ArtifactLimitError("Generated archive exceeds the configured size limit.");
        }
        if (this.totalBytes + this.reservedBytes + sourceStats.size > this.maxTotalBytes) {
            throw new ArtifactLimitError("Artifact storage is full.");
        }

        this.reservedBytes += sourceStats.size;
        const zipPath = this.getZipPath(id);
        const temporaryZipPath = `${zipPath}.tmp`;
        const metadataPath = this.getMetadataPath(id);
        const temporaryMetadataPath = `${metadataPath}.tmp`;
        try {
            await copyFile(generatedArchivePath, temporaryZipPath, fs.constants.COPYFILE_EXCL);
            const checksumSha256 = await this.getChecksum(temporaryZipPath);
            const createdAt = this.now();
            const metadata: StoredArtifact = {
                schemaVersion: 1,
                id,
                createdAt,
                expiresAt: createdAt + this.ttlMs,
                byteSize: sourceStats.size,
                checksumSha256,
                projectSpec,
                projectSpecDigest: this.getProjectSpecDigest(projectSpec),
                ...(idempotencyKeyDigest ? {idempotencyKeyDigest} : {})
            };

            await rename(temporaryZipPath, zipPath);
            await writeFile(temporaryMetadataPath, JSON.stringify(metadata), {encoding: "utf8", mode: 0o600});
            await rename(temporaryMetadataPath, metadataPath);
            this.artifacts.set(id, metadata);
            this.totalBytes += metadata.byteSize;
            return metadata;
        } catch (error) {
            await rm(temporaryZipPath, {force: true}).catch(() => undefined);
            await rm(zipPath, {force: true}).catch(() => undefined);
            await rm(temporaryMetadataPath, {force: true}).catch(() => undefined);
            await rm(metadataPath, {force: true}).catch(() => undefined);
            throw error;
        } finally {
            this.reservedBytes -= sourceStats.size;
        }
    }

    async getAvailableArtifact(id: string): Promise<StoredArtifact | null> {
        if (!/^[a-f0-9]{64}$/.test(id)) {
            return null;
        }
        const artifact = this.artifacts.get(id);
        if (!artifact) {
            return null;
        }
        if (artifact.expiresAt <= this.now()) {
            await this.deleteArtifact(artifact.id);
            return null;
        }
        try {
            const zipStats = await stat(this.getZipPath(id));
            if (!zipStats.isFile() || zipStats.size !== artifact.byteSize) {
                await this.deleteArtifact(id);
                return null;
            }
        } catch {
            await this.deleteArtifact(id);
            return null;
        }
        return artifact;
    }

    getArchivePath(id: string): string {
        if (!/^[a-f0-9]{64}$/.test(id)) {
            throw new Error("Invalid generated artifact ID.");
        }
        return this.getZipPath(id);
    }

    async cleanupExpired(): Promise<void> {
        const expiredIds = Array.from(this.artifacts.values())
            .filter((artifact) => artifact.expiresAt <= this.now())
            .map((artifact) => artifact.id);
        await Promise.all(expiredIds.map((id) => this.deleteArtifact(id)));
    }

    async deleteArtifact(id: string): Promise<void> {
        const artifact = this.artifacts.get(id);
        if (artifact) {
            this.artifacts.delete(id);
            this.totalBytes = Math.max(0, this.totalBytes - artifact.byteSize);
        }
        await this.deleteMetadataAndZip(id);
    }

    private async readMetadata(filePath: string): Promise<StoredArtifact | null> {
        try {
            const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
            if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                return null;
            }
            const metadata = parsed as Partial<StoredArtifact>;
            if (
                metadata.schemaVersion !== 1 ||
                typeof metadata.id !== "string" ||
                !/^[a-f0-9]{64}$/.test(metadata.id) ||
                path.basename(filePath) !== `${metadata.id}.json` ||
                typeof metadata.createdAt !== "number" ||
                typeof metadata.expiresAt !== "number" ||
                typeof metadata.byteSize !== "number" ||
                metadata.byteSize < 0 ||
                typeof metadata.checksumSha256 !== "string" ||
                !/^[a-f0-9]{64}$/.test(metadata.checksumSha256) ||
                typeof metadata.projectSpecDigest !== "string" ||
                typeof metadata.projectSpec !== "object" ||
                metadata.projectSpec === null ||
                (metadata.idempotencyKeyDigest !== undefined && typeof metadata.idempotencyKeyDigest !== "string")
            ) {
                return null;
            }
            return metadata as StoredArtifact;
        } catch {
            return null;
        }
    }

    private async removeUnindexedTemporaryFiles(filenames: string[]): Promise<void> {
        await Promise.all(
            filenames
                .filter((filename) => {
                    if (filename.endsWith(".tmp")) {
                        return true;
                    }
                    if (!filename.endsWith(".zip")) {
                        return false;
                    }
                    const artifactId = filename.slice(0, -".zip".length);
                    return !this.artifacts.has(artifactId);
                })
                .map((filename) => rm(path.join(this.directory, filename), {force: true}))
        );
    }

    private async deleteMetadataAndZip(id: string): Promise<void> {
        if (!/^[a-f0-9]{64}$/.test(id)) {
            return;
        }
        await Promise.all([
            rm(this.getMetadataPath(id), {force: true}),
            rm(this.getZipPath(id), {force: true}),
            rm(`${this.getMetadataPath(id)}.tmp`, {force: true}),
            rm(`${this.getZipPath(id)}.tmp`, {force: true})
        ]);
    }

    private async getChecksum(filePath: string): Promise<string> {
        const checksum = crypto.createHash("sha256");
        await new Promise<void>((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            readStream.on("data", (chunk: Buffer | string) => {
                checksum.update(chunk);
            });
            readStream.on("error", reject);
            readStream.on("end", resolve);
        });
        return checksum.digest("hex");
    }

    private getProjectSpecDigest(projectSpec: ProjectSpec): string {
        return crypto.createHash("sha256").update(JSON.stringify(projectSpec)).digest("hex");
    }

    private getZipPath(id: string): string {
        return path.join(this.directory, `${id}.zip`);
    }

    private getMetadataPath(id: string): string {
        return path.join(this.directory, `${id}.json`);
    }
}

export function createIdempotencyKeyDigest(clientIp: string, idempotencyKey: string): string {
    return crypto.createHash("sha256").update(`${clientIp}\0${idempotencyKey}`).digest("hex");
}

export function createArtifactId(): string {
    return crypto.randomBytes(32).toString("hex");
}
