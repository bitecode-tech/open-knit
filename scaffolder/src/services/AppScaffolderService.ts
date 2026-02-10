import fs from "fs";
import path from "path";
import fileSystemService from "@/services/files/FileSystemService";
import zipService from "@/services/files/ZipService";
import type {Archiver} from "archiver";
import backendScaffolderService, {BackendPayload} from "@/services/BackendScaffolderService";
import frontendScaffolderService, {FrontendPayload} from "@/services/FrontendScaffolderService";
import {ScaffolderRunContext} from "@/types/ScaffolderRunContext";
import {ScaffolderRunHelpers} from "@/types/ScaffolderRunHelpers";

class AppScaffolderService {
    async run(
        runContext: ScaffolderRunContext,
        runHelpers: ScaffolderRunHelpers
    ): Promise<string> {
        const {runStep} = runHelpers;

        const backendPayload = await backendScaffolderService.prepareBackendPayload(
            runContext,
            runHelpers
        );
        const frontendPayload = await frontendScaffolderService.prepareFrontendPayload(
            runContext,
            runHelpers
        );

        const baseZipPath = await this.prepareBaseTree(runContext, runHelpers);

        const zipFilePath = await this.buildAppZipFromSources(
            runContext,
            backendPayload,
            frontendPayload,
            baseZipPath
        );

        console.log(`Created app zip: ${zipFilePath}`);
        return zipFilePath;
    }

    private async buildAppZipFromSources(
        runContext: ScaffolderRunContext,
        backendPayload: BackendPayload,
        frontendPayload: FrontendPayload,
        baseZipPath: string
    ): Promise<string> {
        const {resolvedPaths, backendRootItems, frontendRootItems} = runContext;
        fileSystemService.ensureDirectory(resolvedPaths.outputRoot);
        const zipFileName = this.buildZipFileName(runContext);
        const zipFilePath = path.join(resolvedPaths.outputRoot, zipFileName);

        const zipStart = process.hrtime.bigint();
        await zipService.createZipFromBaseZipAndEntries(baseZipPath, zipFilePath, (archive) => {
            const backendStart = process.hrtime.bigint();
            backendScaffolderService.appendBackendUpdatesToArchive(
                archive,
                runContext,
                backendPayload,
                backendRootItems,
                "backend"
            );
            const backendElapsedMs = Number(
                (process.hrtime.bigint() - backendStart) / 1_000_000n
            );
            console.log(`[scaffolder] Preparing backend files (+${backendElapsedMs}ms)`);

            const frontendStart = process.hrtime.bigint();
            this.appendFrontendUpdatesToArchive(
                archive,
                runContext,
                frontendPayload,
                frontendRootItems,
                "frontend"
            );
            const frontendElapsedMs = Number(
                (process.hrtime.bigint() - frontendStart) / 1_000_000n
            );
            console.log(`[scaffolder] Preparing frontend files (+${frontendElapsedMs}ms)`);
        });
        const zipElapsedMs = Number((process.hrtime.bigint() - zipStart) / 1_000_000n);
        console.log(`[scaffolder] Zipping archive (+${zipElapsedMs}ms)`);

        return zipFilePath;
    }

    private buildZipFileName(runContext: ScaffolderRunContext): string {
        const trimmedName = runContext.applicationName.trim();
        const baseName = trimmedName.length > 0 ? trimmedName : "backend";
        const safeName = baseName.replace(/[\\/:*?"<>|]/g, "-");
        return `${safeName}.zip`;
    }

    async prepareBaseTree(
        runContext: ScaffolderRunContext,
        runHelpers: ScaffolderRunHelpers
    ): Promise<string> {
        const {runStep} = runHelpers;
        if (runContext.cacheMode === "reuse") {
            const cachedZipPath = this.getCachedBaseZipPath(runContext);
            if (!fs.existsSync(cachedZipPath)) {
                throw new Error("Base cache missing. Run build to create cache.");
            }
            return cachedZipPath;
        }
        return await runStep("Building base tree", () => this.buildBaseTree(runContext));
    }

    private async buildBaseTree(runContext: ScaffolderRunContext): Promise<string> {
        const {resolvedPaths, backendRootItems, frontendRootItems, repoRootItems} = runContext;
        const cacheRoot = path.join(resolvedPaths.outputRoot, ".cache");
        const baseTreePath = path.join(cacheRoot, "app-base");
        if (fs.existsSync(baseTreePath)) {
            fs.rmSync(baseTreePath, {recursive: true, force: true});
        }
        fileSystemService.ensureDirectory(baseTreePath);

        this.copyRepoRootItems(resolvedPaths.repositoryRoot, repoRootItems, baseTreePath);
        this.copyBackendBaseItems(resolvedPaths.backendRoot, backendRootItems, baseTreePath);
        this.copyFrontendBaseItems(resolvedPaths.frontendRoot, frontendRootItems, baseTreePath);

        const baseZipPath = this.getCachedBaseZipPath(runContext);
        if (fs.existsSync(baseZipPath)) {
            fs.rmSync(baseZipPath, {force: true});
        }
        fileSystemService.ensureDirectory(path.dirname(baseZipPath));
        await zipService.createZipFromEntries(baseZipPath, (archive) => {
            archive.directory(baseTreePath, false);
        });

        return baseZipPath;
    }

    private getCachedBaseZipPath(runContext: ScaffolderRunContext): string {
        return path.join(runContext.resolvedPaths.outputRoot, ".cache", "app-base.zip");
    }

    private copyRepoRootItems(
        repositoryRoot: string,
        repoRootItems: Set<string>,
        baseTreePath: string
    ): void {
        for (const rootItem of repoRootItems) {
            const sourcePath = path.join(repositoryRoot, rootItem);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Root item "${rootItem}" not found in repository root.`);
            }
            const targetPath = path.join(baseTreePath, rootItem);
            this.copyPath(sourcePath, targetPath);
        }
    }

    private copyBackendBaseItems(
        backendRoot: string,
        backendRootItems: Set<string>,
        baseTreePath: string
    ): void {
        const backendBaseRoot = path.join(baseTreePath, "backend");
        fileSystemService.ensureDirectory(backendBaseRoot);
        const skipRootEntries = new Set([
            "modules",
            "build",
            ".gradle",
            ".env",
            "src",
            "settings.gradle",
            "build.gradle",
            "docker-compose.yml"
        ]);

        for (const rootItem of backendRootItems) {
            if (skipRootEntries.has(rootItem) || rootItem === "modules") {
                continue;
            }
            const sourcePath = path.join(backendRoot, rootItem);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Root item "${rootItem}" not found in backend root.`);
            }
            const targetPath = path.join(backendBaseRoot, rootItem);
            this.copyPath(sourcePath, targetPath);
        }
    }

    private copyFrontendBaseItems(
        frontendRoot: string,
        frontendRootItems: Set<string>,
        baseTreePath: string
    ): void {
        const frontendBaseRoot = path.join(baseTreePath, "frontend");
        fileSystemService.ensureDirectory(frontendBaseRoot);
        const skipRootEntries = new Set([
            "modules",
            "node_modules",
            "dist",
            ".git",
            ".idea",
            "package.json",
            "docker-compose.yml"
        ]);

        for (const rootItem of frontendRootItems) {
            if (skipRootEntries.has(rootItem) || rootItem === "modules") {
                continue;
            }
            const sourcePath = path.join(frontendRoot, rootItem);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Root item "${rootItem}" not found in frontend root.`);
            }
            const targetPath = path.join(frontendBaseRoot, rootItem);
            if (rootItem === "src") {
                this.copyDirectoryRecursiveWithSkips(
                    sourcePath,
                    targetPath,
                    new Set(["node_modules", "dist", ".git", ".idea"]),
                    new Set(["components/admin/AdminLayout.tsx"])
                );
            } else {
                this.copyPath(
                    sourcePath,
                    targetPath,
                    new Set(["node_modules", "dist", ".git", ".idea"])
                );
            }
        }
    }

    private appendFrontendUpdatesToArchive(
        archive: Archiver,
        runContext: ScaffolderRunContext,
        frontendPayload: FrontendPayload,
        frontendRootItems: Set<string>,
        zipPrefix: string
    ): void {
        if (frontendRootItems.has("package.json")) {
            archive.append(frontendPayload.updatedPackageJson, {
                name: path.posix.join(zipPrefix, "package.json")
            });
        }
        if (frontendRootItems.has("docker-compose.yml")) {
            archive.append(frontendPayload.updatedDockerCompose, {
                name: path.posix.join(zipPrefix, "docker-compose.yml")
            });
        }
        if (frontendRootItems.has(".env-template")) {
            archive.append(frontendPayload.envContents, {
                name: path.posix.join(zipPrefix, ".env")
            });
        }
        if (frontendRootItems.has("src")) {
            archive.append(frontendPayload.updatedAdminLayout, {
                name: path.posix.join(
                    zipPrefix,
                    "src",
                    "components",
                    "admin",
                    "AdminLayout.tsx"
                )
            });
        }
        if (frontendRootItems.has("modules")) {
            for (const moduleName of frontendPayload.selectedModules) {
                const sourceModulePath = path.join(
                    runContext.resolvedPaths.frontendModulesRoot,
                    moduleName
                );
                if (!fs.existsSync(sourceModulePath)) {
                    throw new Error(`Module "${moduleName}" not found at ${sourceModulePath}`);
                }
                archive.directory(
                    sourceModulePath,
                    path.posix.join(zipPrefix, "modules", moduleName)
                );
            }
        }
    }

    private copyPath(
        sourcePath: string,
        targetPath: string,
        skipDirectories: Set<string> = new Set<string>()
    ): void {
        const stats = fs.lstatSync(sourcePath);
        if (stats.isSymbolicLink()) {
            return;
        }
        if (stats.isDirectory()) {
            const baseName = path.basename(sourcePath);
            if (skipDirectories.has(baseName)) {
                return;
            }
            this.copyDirectoryRecursive(sourcePath, targetPath, skipDirectories);
            return;
        }
        if (stats.isFile()) {
            fs.mkdirSync(path.dirname(targetPath), {recursive: true});
            fs.copyFileSync(sourcePath, targetPath);
        }
    }

    private copyDirectoryRecursive(
        sourceDirectory: string,
        targetDirectory: string,
        skipDirectories: Set<string> = new Set<string>()
    ): void {
        const filter = (src: string): boolean => {
            const baseName = path.basename(src);
            if (skipDirectories.has(baseName)) {
                return false;
            }
            return true;
        };
        fs.cpSync(sourceDirectory, targetDirectory, {recursive: true, filter});
    }

    private copyDirectoryRecursiveWithSkips(
        sourceDirectory: string,
        targetDirectory: string,
        skipDirectories: Set<string>,
        skipRelativePaths: Set<string>
    ): void {
        const normalizedSkips = new Set(
            Array.from(skipRelativePaths, (value) => value.replace(/\\/g, "/"))
        );
        const filter = (src: string): boolean => {
            const baseName = path.basename(src);
            if (skipDirectories.has(baseName)) {
                return false;
            }
            const relative = path.relative(sourceDirectory, src).replace(/\\/g, "/");
            if (normalizedSkips.has(relative)) {
                return false;
            }
            return true;
        };
        fs.cpSync(sourceDirectory, targetDirectory, {recursive: true, filter});
    }
}

const appScaffolderService = new AppScaffolderService();
export default appScaffolderService;
